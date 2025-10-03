import { NextRequest, NextResponse } from "next/server";
import { Cell } from "ton";
import { DatabaseService } from "@/lib/database";
import { verifyUserTransaction } from "@/lib/ton";

// Background verification endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, hash, boc } = body;

    if (!proofId || !hash || !boc) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Parse BOC
    const cell = Cell.fromBase64(boc);
    
    // Verify the transaction on-chain (this will wait 15 seconds)
    const verificationResult = await verifyUserTransaction(cell, hash);

    if (!verificationResult.success) {
      // Update proof with error
      await DatabaseService.updateProofVerification(proofId, {
        status: "failed",
        errorMessage: verificationResult.error || "Verification failed",
      });
      
      return NextResponse.json({ success: false, error: verificationResult.error });
    }

    // Update proof with verified status
    await DatabaseService.updateProofVerification(proofId, {
      status: "verified",
      tonTransactionHash: verificationResult.transactionHash,
      tonTransactionLt: verificationResult.transactionLt,
      tonscanUrl: verificationResult.tonscanUrl,
      errorMessage: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}

