import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, telegram } = body;

    // At least one identifier must be provided
    if (!walletAddress && !telegram) {
      return NextResponse.json(
        { success: false, error: "Either wallet address or Telegram data is required" },
        { status: 400 }
      );
    }

    // Validate wallet address format if provided
    if (walletAddress) {
      const tonAddressRegex = /^(EQ|UQ|0:)[A-Za-z0-9_-]{46,48}$/;
      if (!tonAddressRegex.test(walletAddress)) {
        return NextResponse.json(
          { success: false, error: "Invalid TON wallet address format" },
          { status: 400 }
        );
      }
    }

    const client = await pool.connect();
    try {
      // Check if user exists by wallet OR telegram
      let existingUser;
      
      if (walletAddress && telegram) {
        // Check by both wallet and telegram (can match either)
        existingUser = await client.query(
          "SELECT * FROM users_v2 WHERE wallet_address = $1 OR telegram_id = $2",
          [walletAddress, telegram.id]
        );
      } else if (walletAddress) {
        // Check by wallet only
        existingUser = await client.query(
          "SELECT * FROM users_v2 WHERE wallet_address = $1",
          [walletAddress]
        );
      } else if (telegram) {
        // Check by telegram only
        existingUser = await client.query(
          "SELECT * FROM users_v2 WHERE telegram_id = $1",
          [telegram.id]
        );
      }

      let user;

      if (existingUser && existingUser.rows.length > 0) {
        // User exists - update with new data
        const existing = existingUser.rows[0];
        
        // Build update query dynamically based on what's provided
        const updates: string[] = [];
        const values: (string | number | boolean | null)[] = [];
        let paramIndex = 1;
        
        // Update wallet if provided and different
        if (walletAddress && existing.wallet_address !== walletAddress) {
          updates.push(`wallet_address = $${paramIndex++}`);
          values.push(walletAddress);
        }
        
        // Update Telegram data if provided
        if (telegram) {
          updates.push(
            `telegram_id = $${paramIndex++}`,
            `telegram_username = $${paramIndex++}`,
            `telegram_first_name = $${paramIndex++}`,
            `telegram_last_name = $${paramIndex++}`,
            `telegram_photo_url = $${paramIndex++}`,
            `telegram_is_premium = $${paramIndex++}`,
            `telegram_language_code = $${paramIndex++}`,
            `telegram_allows_write_to_pm = $${paramIndex++}`,
            `telegram_added_to_attachment_menu = $${paramIndex++}`
          );
          values.push(
            telegram.id,
            telegram.username,
            telegram.firstName,
            telegram.lastName,
            telegram.photoUrl,
            telegram.isPremium || false,
            telegram.languageCode,
            telegram.allowsWriteToPm || false,
            telegram.addedToAttachmentMenu || false
          );
        }
        
        // Set is_guest = false if has wallet now
        if (walletAddress) {
          updates.push(`is_guest = false`);
        }
        
        // Always update timestamps
        updates.push(`last_login = CURRENT_TIMESTAMP`, `updated_at = CURRENT_TIMESTAMP`);
        
        // Add WHERE clause value
        values.push(existing.id);
        
        const result = await client.query(
          `UPDATE users_v2 SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
          values
        );
        user = result.rows[0];
      } else {
        // Create new user
        // is_guest = true if no wallet, false if has wallet
        const isGuest = !walletAddress;
        
        const result = await client.query(
          `INSERT INTO users_v2 (
            wallet_address,
            telegram_id,
            telegram_username,
            telegram_first_name,
            telegram_last_name,
            telegram_photo_url,
            telegram_is_premium,
            telegram_language_code,
            telegram_allows_write_to_pm,
            telegram_added_to_attachment_menu,
            is_guest,
            user_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`,
          [
            walletAddress || null, // Can be NULL for Telegram-only users
            telegram?.id || null,
            telegram?.username || null,
            telegram?.firstName || null,
            telegram?.lastName || null,
            telegram?.photoUrl || null,
            telegram?.isPremium || false,
            telegram?.languageCode || null,
            telegram?.allowsWriteToPm || false,
            telegram?.addedToAttachmentMenu || false,
            isGuest, // Guest if no wallet, authenticated if has wallet
            "individual",
          ]
        );
        user = result.rows[0];
      }

      return NextResponse.json({
        success: true,
        user,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

