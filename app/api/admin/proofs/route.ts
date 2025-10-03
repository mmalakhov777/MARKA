import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";
import { requireAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/proofs - Get all proofs
export async function GET(request: NextRequest) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const proofs = await DatabaseService.getAllProofs();
    return NextResponse.json({
      success: true,
      data: proofs,
      total: proofs.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch proofs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/proofs - Create new proof (admin only)
export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { hash, fileName, fileSize, fileType, tonTransactionHash, tonTransactionLt } = body;

    if (!hash || !fileName) {
      return NextResponse.json(
        { success: false, error: "Hash and fileName are required" },
        { status: 400 }
      );
    }

    const savedProof = await DatabaseService.saveProof({
      hash,
      fileName,
      fileSize: fileSize || 0,
      fileType: fileType || "unknown",
      tonTransactionHash,
      tonTransactionLt
    });

    return NextResponse.json({
      success: true,
      data: savedProof
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create proof" },
      { status: 500 }
    );
  }
}
