import { NextRequest, NextResponse } from "next/server";
import { DatabaseService, pool } from "@/lib/database";
import { requireAdminAuth } from "@/lib/admin-auth";

export const runtime = "nodejs";

// GET /api/admin/proofs/[id] - Get specific proof
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid proof ID" },
        { status: 400 }
      );
    }

    const proof = await DatabaseService.getProofById(numericId);

    if (!proof) {
      return NextResponse.json(
        { success: false, error: "Proof not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: DatabaseService.toHashResponse(proof)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch proof" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/proofs/[id] - Update proof
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid proof ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hash, fileName, fileSize, fileType, tonTransactionHash, tonTransactionLt } = body;

    // For update, we need to use a custom update method since DatabaseService doesn't have update
    // Let's use the database pool directly
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE proofs 
        SET 
          hash = $2,
          file_name = $3,
          file_size = $4,
          file_type = $5,
          ton_transaction_hash = $6,
          ton_transaction_lt = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [numericId, hash, fileName, fileSize, fileType, tonTransactionHash, tonTransactionLt]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Proof not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: DatabaseService.toHashResponse(result.rows[0])
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update proof" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/proofs/[id] - Delete proof
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, error: "Invalid proof ID" },
        { status: 400 }
      );
    }

    // Use database pool directly for delete
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        DELETE FROM proofs WHERE id = $1 RETURNING *
      `, [numericId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Proof not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Proof deleted successfully",
        data: DatabaseService.toHashResponse(result.rows[0])
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete proof" },
      { status: 500 }
    );
  }
}
