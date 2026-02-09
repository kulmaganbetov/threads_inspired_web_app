import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/store";

/**
 * POST /api/auth/login
 * Body: { username: string, password: string }
 * Returns token + user object on success.
 */
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const result = authenticateUser(username, password);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
