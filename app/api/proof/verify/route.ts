import { NextRequest, NextResponse } from "next/server";
import { Cell } from "ton";
import { DatabaseService } from "@/lib/database";
import { verifyUserTransaction } from "@/lib/ton";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, fileName, fileSize, fileType, userId, boc } = body;

    if (!hash || !fileName || !boc) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse the BOC to extract transaction details
    const cell = Cell.fromBase64(boc);
    
    // Verify the transaction on-chain
    const verificationResult = await verifyUserTransaction(cell, hash);

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.error || "Transaction verification failed" },
        { status: 400 }
      );
    }

    // Save to database with verified status
    const savedProof = await DatabaseService.saveProof({
      userId: userId || undefined,
      hash,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || "unknown",
      tonTransactionHash: verificationResult.transactionHash,
      tonTransactionLt: verificationResult.transactionLt,
      tonscanUrl: verificationResult.tonscanUrl,
      status: "verified",
      errorMessage: null,
    });

    return NextResponse.json(DatabaseService.toHashResponse(savedProof));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
