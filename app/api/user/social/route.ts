import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET - Fetch user's social accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM social_accounts 
       WHERE user_v2_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      accounts: result.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch social accounts" },
      { status: 500 }
    );
  }
}

// POST - Submit new social account for verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, platform, profileUrl, verificationPostUrl } = body;

    if (!userId || !platform || !profileUrl || !verificationPostUrl) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO social_accounts 
       (user_v2_id, platform, profile_url, verification_post_url, status) 
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, platform, profileUrl, verificationPostUrl]
    );

    return NextResponse.json({
      success: true,
      account: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to submit social account" },
      { status: 500 }
    );
  }
}

// DELETE - Remove social account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const userId = searchParams.get("userId");

    if (!accountId || !userId) {
      return NextResponse.json(
        { success: false, error: "Account ID and User ID required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    await pool.query(
      `DELETE FROM social_accounts 
       WHERE id = $1 AND user_v2_id = $2`,
      [accountId, userId]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete social account" },
      { status: 500 }
    );
  }
}

