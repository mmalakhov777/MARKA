import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Query proofs using the user_v2_id column (UUID)
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM proofs 
         WHERE user_v2_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        proofs: result.rows,
        count: result.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch proofs" 
      },
      { status: 500 }
    );
  }
}
