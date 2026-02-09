import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/store";

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
export async function POST(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");

  if (token) {
    logoutUser(token);
  }

  return NextResponse.json({ ok: true });
}
