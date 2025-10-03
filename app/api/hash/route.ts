import crypto from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { submitTonTransaction } from "@/lib/ton";
import { DatabaseService } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const userIdString = formData.get("userId");
    
    // Get user ID if provided (from authenticated user) - keep as string for UUID format
    const userId = userIdString ? (userIdString as string) : undefined;

    if (!(file instanceof Blob)) {
      return NextResponse.json({ message: "File upload missing" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Always create a new proof (no deduplication)
    // Each upload creates a unique proof with timestamp and user context
    const tonResponse = await submitTonTransaction(hash);
    
    try {
      const savedProof = await DatabaseService.saveProof({
        userId: userId,
        hash: tonResponse.hash,
        fileName: file.name || "unknown",
        fileSize: file.size || 0,
        fileType: file.type || "unknown",
        tonTransactionHash: tonResponse.tonTransactionHash ?? undefined,
        tonTransactionLt: tonResponse.tonTransactionLt ?? undefined,
        tonscanUrl: tonResponse.tonscanUrl,
        status: tonResponse.status,
        errorMessage: tonResponse.errorMessage
      });

      return NextResponse.json(DatabaseService.toHashResponse(savedProof));
    } catch (dbError) {
      // Return response anyway since TON transaction was submitted
      return NextResponse.json(tonResponse);
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong. Please try again." }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  // Try to parse as numeric ID first
  const numericId = parseInt(id);
  let proof;

  if (!isNaN(numericId)) {
    proof = await DatabaseService.getProofById(numericId);
  } else {
    // If not numeric, treat as hash (gets most recent proof with that hash)
    proof = await DatabaseService.getProofByHash(id);
  }

  if (!proof) {
    return NextResponse.json({ message: "Proof not found" }, { status: 404 });
  }

  return NextResponse.json(DatabaseService.toHashResponse(proof));
}

