import { NextResponse } from "next/server";
import { getUserByToken, getUserStats, getPostsByUser } from "@/lib/store";

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns current user profile, stats, and posts.
 */
export async function GET(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated." },
      { status: 401 }
    );
  }

  const stats = getUserStats(user.id);
  const posts = getPostsByUser(user.id);

  return NextResponse.json({ user, stats, posts });
}
