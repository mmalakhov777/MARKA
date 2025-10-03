import { NextRequest, NextResponse } from "next/server";
import { Cell } from "ton";
import { DatabaseService } from "@/lib/database";

// Submit proof immediately without waiting for verification
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

    // Parse BOC to extract transaction details for later verification
    let transactionLt: string | undefined;
    let transactionHash: string | undefined;
    
    try {
      Cell.fromBase64(boc);
      // Store BOC for background verification (or extract hints if available)
      // For now, we'll just save as pending and verify later
    } catch (bocError) {
      // BOC parse error
    }

    // Save to database immediately with pending status
    const savedProof = await DatabaseService.saveProof({
      userId: userId || undefined,
      hash,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || "unknown",
      tonTransactionHash: transactionHash,
      tonTransactionLt: transactionLt,
      tonscanUrl: null,
      status: "pending",
      errorMessage: null,
    });

    // Trigger async verification (import and call directly, fire and forget)
    // Don't await - let it run in background
    import("@/lib/ton").then(async ({ verifyUserTransaction }) => {
      try {
        const cell = Cell.fromBase64(boc);
        const verificationResult = await verifyUserTransaction(cell, hash);

        if (verificationResult.success) {
          await DatabaseService.updateProofVerification(savedProof.id, {
            status: "verified",
            tonTransactionHash: verificationResult.transactionHash,
            tonTransactionLt: verificationResult.transactionLt,
            tonscanUrl: verificationResult.tonscanUrl,
            errorMessage: null,
          });
        } else {
          await DatabaseService.updateProofVerification(savedProof.id, {
            status: "failed",
            errorMessage: verificationResult.error || "Verification failed",
          });
        }
      } catch (verifyError) {
        await DatabaseService.updateProofVerification(savedProof.id, {
          status: "failed",
          errorMessage: verifyError instanceof Error ? verifyError.message : "Verification failed",
        });
      }
    }).catch(() => {
      // Failed to start async verification
    });

    return NextResponse.json(DatabaseService.toHashResponse(savedProof));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Submission failed" },
      { status: 500 }
    );
  }
}

