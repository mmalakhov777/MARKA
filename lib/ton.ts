import { nanoid } from "nanoid";
import { mnemonicToWalletKey } from "@ton/crypto";
import {
  beginCell,
  internal,
  toNano,
  TonClient,
  WalletContractV4,
} from "ton";
import https from "https";

import { type HashResponse } from "@/lib/validation";

const tonscanBaseUrl = process.env.NEXT_PUBLIC_TONSCAN_BASE_URL ?? "https://tonscan.org/tx";
const walletAddress = process.env.TON_WALLET_ADDRESS ?? "";
const walletSeed = process.env.TON_WALLET_SEED ?? "";
const toncenterEndpoint = process.env.TONCENTER_ENDPOINT ?? "https://toncenter.com/api/v2/jsonRPC";
const toncenterApiKey = process.env.TONCENTER_API_KEY ?? "";
const toncenterRestBase = (() => {
  try {
    const url = new URL(toncenterEndpoint);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return "https://toncenter.com";
  }
})();

const tonClient = new TonClient({
  endpoint: toncenterEndpoint,
  apiKey: toncenterApiKey || undefined,
});

function createCommentCell(comment: string) {
  return beginCell().storeUint(0, 32).storeStringTail(comment).endCell();
}

type ToncenterTransaction = {
  lt: string;
  hashHex: string;
  hashBase64Url: string;
  hashBase64Raw: string;
};

async function getTransactionHashFromToncenter(
  address: string,
  ltHint?: string,
  hashHint?: string,
  retryCount = 0
): Promise<ToncenterTransaction> {
  const maxRetries = 3;
  const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
  const query = new URLSearchParams({
    address,
    limit: "1",
    archival: "true",
  });

  if (ltHint) {
    query.set("lt", ltHint);
  }

  if (hashHint) {
    query.set("hash", hashHint);
  }

  const url = `${toncenterRestBase}/api/v2/getTransactions?${query.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: toncenterApiKey
        ? {
            "X-API-Key": toncenterApiKey,
          }
        : undefined,
    });

  if (!response.ok) {
    let errorBody = "";
    try {
      errorBody = await response.text();
    } catch (e) {
      // Error reading response body
    }
    
    // Retry on 5xx server errors
    if (response.status >= 500 && response.status < 600 && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return getTransactionHashFromToncenter(address, ltHint, hashHint, retryCount + 1);
    }
    
    throw new Error(`Toncenter getTransactions failed (status ${response.status}): ${errorBody || response.statusText}`);
  }

  const data = (await response.json()) as {
    ok: boolean;
    result?: Array<{
      transaction_id: { lt: string; hash: string };
    }>;
    error?: string;
  };

  if (!data.ok || !data.result?.length) {
    // Retry on API-level errors too, as they might be transient
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return getTransactionHashFromToncenter(address, ltHint, hashHint, retryCount + 1);
    }
    throw new Error(data.error ?? "Toncenter response missing result");
  }

  const tx = data.result[0];
  const lt = tx.transaction_id.lt;
  const hashBase64 = tx.transaction_id.hash;
  const hashHex = Buffer.from(hashBase64, "base64").toString("hex");
  const hashBase64Url = hashBase64.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  return { lt, hashHex, hashBase64Url, hashBase64Raw: hashBase64 };

  } catch (networkError) {
    // Handle network errors and other fetch-related exceptions
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return getTransactionHashFromToncenter(address, ltHint, hashHint, retryCount + 1);
    }
    
    throw new Error(`Network error when fetching from Toncenter: ${networkError}`);
  }
}

export async function submitTonTransaction(hash: string): Promise<HashResponse> {
  const id = nanoid();

  if (!walletSeed || !walletAddress) {
    throw new Error("Wallet credentials are missing");
  }

  if (!toncenterEndpoint) {
    throw new Error("TONCENTER_ENDPOINT environment variable is missing");
  }

  try {

    const mnemonicWords = walletSeed.trim().split(/\s+/);
    const keyPair = await mnemonicToWalletKey(mnemonicWords);
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    });

    const walletState = await tonClient.getContractState(wallet.address);
    const openedWallet = tonClient.open(wallet);

    const seqno = walletState.state === "active" ? await openedWallet.getSeqno() : 0;

    await openedWallet.sendTransfer({
      seqno,
      secretKey: keyPair.secretKey,
      messages: [
        internal({
          to: wallet.address,
          value: toNano("0.01"),
          body: createCommentCell(`Proof:${hash}`),
          bounce: false,
        }),
      ],
    });

    const walletStateAfter = await tonClient.getContractState(wallet.address);

    if (!walletStateAfter.lastTransaction?.lt || !walletStateAfter.lastTransaction?.hash) {
      throw new Error("Transaction not found in wallet state after submission");
    }

    const pendingLt = walletStateAfter.lastTransaction.lt;
    const pendingHashBase64 = walletStateAfter.lastTransaction.hash;
    const pendingHashHex = pendingHashBase64
      ? Buffer.from(pendingHashBase64, "base64").toString("hex")
      : undefined;

    return {
      id,
      hash,
      tonscanUrl: null,
      createdAt: new Date().toISOString(),
      tonTransactionHash: pendingHashHex ?? null,
      tonTransactionLt: pendingLt ?? null,
      status: "pending",
      errorMessage: null,
      lastCheckedAt: null,
    } satisfies HashResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unknown error during TON transaction submission");
  }
}

export async function verifyTonTransaction(options: {
  lt?: string | null;
  hashHex?: string | null;
}) {
  if (!walletAddress) {
    throw new Error("Wallet address is missing");
  }

  const tonscanHost = new URL(tonscanBaseUrl).host;
  const isTestnet = tonscanHost.includes("testnet");
  const tonscanPath = isTestnet ? "tx" : "transaction";

  const hashBase64 = options.hashHex
    ? Buffer.from(options.hashHex, "hex").toString("base64")
    : undefined;

  const hintAttempts: Array<{ lt?: string; hash?: string }> = [];

  if (options.lt || hashBase64) {
    hintAttempts.push({ lt: options.lt ?? undefined, hash: hashBase64 });
  }

  hintAttempts.push({});

  let lastError: unknown;

  for (const hint of hintAttempts) {
    try {
      const txHashData = await getTransactionHashFromToncenter(
        walletAddress,
        hint.lt,
        hint.hash
      );

      if (options.lt && txHashData.lt !== options.lt) {
        continue;
      }

      const tonscanUrl = `${tonscanBaseUrl.replace(/\/tx$/, "")}/${tonscanPath}/${txHashData.lt}/${encodeURIComponent(
        isTestnet ? txHashData.hashBase64Url : txHashData.hashBase64Raw
      )}`;

      return {
        tonscanUrl,
        tonTransactionHash: txHashData.hashHex,
        tonTransactionLt: txHashData.lt,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Transaction verification failed - indexer could not locate transaction");
}

// Verify user-initiated transaction (user wallet -> server wallet)
export async function verifyUserTransaction(bocCell: { toBoc: () => Buffer }, expectedHash: string) {
  try {
    // Wait a bit for transaction to be indexed (increased for mainnet)
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Get recent transactions to our wallet
    const query = new URLSearchParams({
      address: walletAddress,
      limit: "50", // Increased to check more recent transactions
      archival: "true",
    });

    const url = `${toncenterRestBase}/api/v2/getTransactions?${query.toString()}`;
    
    // Use native https module instead of fetch to avoid connection issues
    const data = await new Promise<{
      ok: boolean;
      result?: Array<{
        transaction_id: { lt: string; hash: string };
        in_msg?: {
          source?: string;
          destination?: string;
          value?: string;
          message?: string;
        };
      }>;
    }>((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(toncenterApiKey ? { 'X-API-Key': toncenterApiKey } : {}),
        },
        timeout: 30000,
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}: ${responseData.substring(0, 100)}`));
              return;
            }
            
            const jsonData = JSON.parse(responseData);
            resolve(jsonData);
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });

      req.end();
    }) as {
      ok: boolean;
      result?: Array<{
        transaction_id: { lt: string; hash: string };
        in_msg?: {
          source?: string;
          destination?: string;
          value?: string;
          message?: string;
        };
      }>;
    };

    if (!data.ok || !data.result?.length) {
      return {
        success: false,
        error: "No recent transactions found. Please wait 30 seconds and try again.",
      };
    }

    const proofAmount = process.env.PROOF_AMOUNT || "0.05";
    const expectedAmount = BigInt(parseFloat(proofAmount) * 1e9);

    // Find matching transaction
    for (let i = 0; i < data.result.length; i++) {
      const tx = data.result[i];
      const inMsg = tx.in_msg;
      
      if (!inMsg) {
        continue;
      }

      // Check if transaction is to our wallet (handle both bounceable EQ and non-bounceable UQ formats)
      // Need to convert to raw format (0:hex) for proper comparison
      const Address = await import("ton").then(m => m.Address);
      
      let normalizedDest: string;
      let normalizedWallet: string;
      
      try {
        // Parse both addresses to raw format for comparison
        const destAddr = Address.parse(inMsg.destination || '');
        const walletAddr = Address.parse(walletAddress);
        
        normalizedDest = destAddr.toRawString();
        normalizedWallet = walletAddr.toRawString();
      } catch (parseError) {
        continue;
      }
      
      if (normalizedDest !== normalizedWallet) {
        continue;
      }

      // Check amount (allow 10% tolerance for gas fees)
      const txAmount = BigInt(inMsg.value || "0");
      const minAmount = (expectedAmount * BigInt(90)) / BigInt(100);
      
      if (txAmount < minAmount) {
        continue;
      }

      // Check message/comment contains expected hash
      const message = inMsg.message || "";
      
      if (!message.includes(expectedHash)) {
        continue;
      }

      // Transaction verified!
      
      const lt = tx.transaction_id.lt;
      const hashHex = Buffer.from(tx.transaction_id.hash, "base64").toString("hex");
      const hashBase64Url = tx.transaction_id.hash
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      const tonscanHost = new URL(tonscanBaseUrl).host;
      const isTestnet = tonscanHost.includes("testnet");
      const tonscanPath = isTestnet ? "tx" : "transaction";
      
      const tonscanUrl = `${tonscanBaseUrl.replace(/\/tx$/, "")}/${tonscanPath}/${lt}/${encodeURIComponent(
        isTestnet ? hashBase64Url : tx.transaction_id.hash
      )}`;

      return {
        success: true,
        transactionHash: hashHex,
        transactionLt: lt,
        tonscanUrl,
      };
    }

    return {
      success: false,
      error: "Transaction not found. Please ensure you sent the correct amount with the proof hash. Check server logs for details.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

