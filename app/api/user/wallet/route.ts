import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, walletAddress } = body;

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "User ID and wallet address are required" },
        { status: 400 }
      );
    }

    // Validate wallet address format (TON addresses start with EQ, UQ, or 0:)
    const tonAddressRegex = /^(EQ|UQ|0:)[A-Za-z0-9_-]{46,48}$/;
    if (!tonAddressRegex.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid TON wallet address format" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if wallet is already bound to another user (in new users_v2 table)
      const existingWallet = await client.query(
        "SELECT id FROM users_v2 WHERE wallet_address = $1 AND id != $2",
        [walletAddress, userId]
      );

      if (existingWallet.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: "This wallet is already bound to another account" },
          { status: 409 }
        );
      }

      // Update user's wallet address (in new users_v2 table)
      const result = await client.query(
        `UPDATE users_v2 
         SET wallet_address = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING wallet_address`,
        [walletAddress, userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        walletAddress: result.rows[0].wallet_address,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save wallet address" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Note: We can't actually set wallet_address to NULL in users_v2 
      // because it's NOT NULL. Instead, we should delete the user or 
      // just disconnect the TON Connect UI. For now, just disconnect.
      // The wallet address stays in DB but user won't be connected in UI.
      
      return NextResponse.json({ 
        success: true,
        message: "Wallet disconnected from UI. Address remains in database."
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to remove wallet address" },
      { status: 500 }
    );
  }
}
