"use client";

import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { beginCell } from "ton";

import { type Dictionary } from "@/lib/i18n";
import { useWalletAuth } from "@/lib/wallet-auth";

type UploadStage = "idle" | "hashing" | "payment" | "submitting";

type Props = {
  dictionary: Dictionary;
};

const PROOF_AMOUNT = process.env.NEXT_PUBLIC_PROOF_AMOUNT || "0.05"; // 0.05 TON default
const SERVER_WALLET = process.env.NEXT_PUBLIC_TON_WALLET_ADDRESS || "";

export function UploadForm({ dictionary }: Props) {
  const router = useRouter();
  const { user } = useWalletAuth();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (!wallet) {
        throw new Error("Please connect your TON wallet first");
      }

      if (!SERVER_WALLET) {
        throw new Error("Server wallet not configured. Check console for details.");
      }

      // Step 1: Calculate file hash
      setStage("hashing");
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Step 2: Create TON transaction
      setStage("payment");
      const comment = `Proof:${hash}`;
      const body = beginCell()
        .storeUint(0, 32)
        .storeStringTail(comment)
        .endCell()
        .toBoc()
        .toString("base64");

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 min
        messages: [
          {
            address: SERVER_WALLET,
            amount: (parseFloat(PROOF_AMOUNT) * 1e9).toString(), // Convert to nanotons
            payload: body,
          },
        ],
      };

      // Send transaction and wait for user confirmation
      const result = await tonConnectUI.sendTransaction(transaction);

      // Step 3: Submit to backend (async verification)
      setStage("submitting");
      const response = await fetch("/api/proof/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: user?.id || null, // Use user.id (UUID) for user_v2_id compatibility
          boc: result.boc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const submitResult = await response.json();
      return submitResult;
    },
    onSuccess: (data) => {
      setStage("idle");
      // Force refresh to clear any cached data
      router.refresh();
      router.push(`/proof/${data.id}`);
    },
    onError: (err) => {
      setStage("idle");
      setError(err instanceof Error ? err.message : dictionary["status.error"]);
    },
    retry: false,
  });

  const isLoading = mutation.isPending;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      setSelectedFile(file);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError(dictionary["home.fileLabel"]);
      return;
    }

    if (selectedFile.size === 0) {
      setError(dictionary["status.error"]);
      return;
    }

    mutation.mutate(selectedFile);
  }

  function resetSelection() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label
        htmlFor="file-upload"
        className={clsx(
          "group relative cursor-pointer overflow-hidden rounded-lg border transition-all",
          selectedFile 
            ? "border-neutral-400 bg-neutral-50" 
            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
        )}
      >
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/*,audio/*"
        />

        <div className="p-5">
          {selectedFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                  <svg className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetSelection}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center border border-dashed border-neutral-300 rounded-lg bg-neutral-50/50 p-8 transition group-hover:border-neutral-400">
              <div className="text-center">
                <svg className="mx-auto mb-2 h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-neutral-600">
                  {dictionary["home.supported"]}
                </p>
              </div>
            </div>
          )}
        </div>
      </label>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!mounted ? (
        <button
          type="button"
          disabled
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-400"
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          Loading...
        </button>
      ) : !wallet ? (
        <button
          type="button"
          onClick={() => tonConnectUI.openModal()}
          className="flex h-12 items-center justify-center rounded-lg bg-neutral-900 text-sm font-medium text-white transition-all hover:bg-neutral-800 active:scale-[0.99]"
        >
          Connect Wallet
        </button>
      ) : (
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className={clsx(
            "flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all",
            isLoading || !selectedFile
              ? "cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400"
              : "bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.99]"
          )}
        >
          {!isLoading && !selectedFile && <span>Select a file</span>}
          {!isLoading && selectedFile && <span>Pay {PROOF_AMOUNT} TON & Register</span>}
          {isLoading && (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-white" />
              <span>
                {stage === "hashing"
                  ? "Hashing..."
                  : stage === "payment"
                  ? "Payment..."
                  : "Submitting..."}
              </span>
            </>
          )}
        </button>
      )}
    </form>
  );
}

