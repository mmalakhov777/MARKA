import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // Legacy: Telegram ID
    const walletAddress = searchParams.get("walletAddress"); // New: Wallet address
    const id = searchParams.get("id"); // New: UUID

    if (!userId && !walletAddress && !id) {
      return NextResponse.json(
        { success: false, error: "User ID, wallet address, or id is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      let result;
      
      // Try to query from new users_v2 table first
      if (walletAddress) {
        result = await client.query(
          "SELECT * FROM users_v2 WHERE wallet_address = $1",
          [walletAddress]
        );
      } else if (id) {
        result = await client.query(
          "SELECT * FROM users_v2 WHERE id = $1",
          [id]
        );
      } else if (userId) {
        // Legacy support: Telegram ID
        result = await client.query(
          "SELECT * FROM users_v2 WHERE telegram_id = $1",
          [userId]
        );
        
        // Fallback to old table if not found
        if (result.rows.length === 0) {
          result = await client.query(
            "SELECT * FROM users WHERE id = $1",
            [userId]
          );
        }
      }

      if (!result || result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
