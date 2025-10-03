import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const client = await pool.connect();
    try {
      // If userId is provided, fetch single user
      if (userId) {
        // userId is the telegram_id (numeric), not the UUID
        const result = await client.query(
          "SELECT * FROM users_v2 WHERE telegram_id = $1",
          [userId]
        );
        
        if (result.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
          );
        }

        // Map users_v2 fields to expected format
        const user = {
          id: result.rows[0].telegram_id || result.rows[0].id,
          first_name: result.rows[0].telegram_first_name || "Guest",
          last_name: result.rows[0].telegram_last_name || null,
          username: result.rows[0].telegram_username || null,
          language_code: result.rows[0].telegram_language_code || null,
          is_premium: result.rows[0].telegram_is_premium || false,
          is_bot: false,
          photo_url: result.rows[0].telegram_photo_url || null,
          added_to_attachment_menu: result.rows[0].telegram_added_to_attachment_menu || false,
          allows_write_to_pm: result.rows[0].telegram_allows_write_to_pm || false,
          wallet_address: result.rows[0].wallet_address || null,
          created_at: result.rows[0].created_at,
          updated_at: result.rows[0].updated_at,
          last_login: result.rows[0].last_login,
        };

        return NextResponse.json({
          success: true,
          user,
        });
      }

      // Otherwise fetch all users
      const result = await client.query(`
        SELECT * FROM users_v2 ORDER BY last_login DESC
      `);

      // Map users_v2 fields to expected format
      const users = result.rows.map(row => ({
        id: row.telegram_id || row.id,
        first_name: row.telegram_first_name || "Guest",
        last_name: row.telegram_last_name || null,
        username: row.telegram_username || null,
        language_code: row.telegram_language_code || null,
        is_premium: row.telegram_is_premium || false,
        is_bot: false,
        photo_url: row.telegram_photo_url || null,
        added_to_attachment_menu: row.telegram_added_to_attachment_menu || false,
        allows_write_to_pm: row.telegram_allows_write_to_pm || false,
        wallet_address: row.wallet_address || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        last_login: row.last_login,
      }));

      return NextResponse.json({
        success: true,
        users: users,
        count: users.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch users" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      if (action === "remove_wallet") {
        // Remove wallet address from user
        // userId is the telegram_id (numeric), not the UUID
        const result = await client.query(
          `UPDATE users_v2 
           SET wallet_address = NULL, updated_at = CURRENT_TIMESTAMP 
           WHERE telegram_id = $1
           RETURNING id, telegram_first_name, wallet_address`,
          [userId]
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Wallet removed successfully",
          user: result.rows[0],
        });
      }

      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update user" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Check authentication
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Start transaction
      await client.query("BEGIN");

      // First, check if user exists
      // userId is the telegram_id (numeric), not the UUID
      const userCheck = await client.query(
        "SELECT id, telegram_id, telegram_first_name, telegram_last_name FROM users_v2 WHERE telegram_id = $1",
        [userId]
      );

      if (userCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const user = userCheck.rows[0];
      const userUuid = user.id; // The UUID primary key in users_v2

      // Delete all proofs associated with this user's telegram_id
      // (proofs table still uses telegram_id as user_id)
      const proofsDeleted = await client.query(
        "DELETE FROM proofs WHERE user_id = $1",
        [user.telegram_id]
      );

      // Delete the user by UUID
      await client.query(
        "DELETE FROM users_v2 WHERE id = $1",
        [userUuid]
      );

      // Commit transaction
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
        deletedUser: {
          id: user.telegram_id,
          name: `${user.telegram_first_name || ""} ${user.telegram_last_name || ""}`.trim() || "Guest",
        },
        proofsDeleted: proofsDeleted.rowCount || 0,
      });
    } catch (error) {
      // Rollback on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete user" 
      },
      { status: 500 }
    );
  }
}
