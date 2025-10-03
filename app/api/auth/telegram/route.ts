import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { DatabaseService } from "@/lib/database";

// Verify Telegram WebApp data signature
function verifyTelegramWebAppData(initData: string): boolean {
  // In development, skip verification
  if (process.env.NODE_ENV === "development" && !initData) {
    return true;
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    return true; // Allow in development
  }

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    if (!hash) {
      return false;
    }

    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Create secret key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(BOT_TOKEN)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return calculatedHash === hash;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, initDataRaw } = body;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Invalid user data" },
        { status: 400 }
      );
    }

    // Verify Telegram data (skip in development)
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyTelegramWebAppData(initDataRaw);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid Telegram data" },
          { status: 401 }
        );
      }
    }

    // Save or update user in database
    const savedUser = await DatabaseService.saveUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      languageCode: user.languageCode,
      isPremium: user.isPremium,
      isBot: false,
      photoUrl: user.photoUrl,
      addedToAttachmentMenu: user.addedToAttachmentMenu,
      allowsWriteToPm: user.allowsWriteToPm,
    });


    return NextResponse.json({
      success: true,
      user: {
        id: savedUser.id,
        firstName: savedUser.first_name,
        lastName: savedUser.last_name,
        username: savedUser.username,
        isNew: savedUser.created_at === savedUser.updated_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Authentication failed" 
      },
      { status: 500 }
    );
  }
}

// Optional: Get current user info
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-telegram-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await DatabaseService.getUserById(parseInt(userId));

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        isPremium: user.is_premium,
        languageCode: user.language_code,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get user" },
      { status: 500 }
    );
  }
}


