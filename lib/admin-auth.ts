import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

/**
 * Middleware function to check if admin is authenticated
 * Use this in your admin API routes
 */
export async function requireAdminAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionToken?.value) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Session is valid
    return null;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication check failed" },
      { status: 500 }
    );
  }
}

/**
 * Check if current session is authenticated (for client components)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);
    return !!sessionToken?.value;
  } catch {
    return false;
  }
}

