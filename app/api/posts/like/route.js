import { NextResponse } from "next/server";
import { getUserByToken, toggleLike } from "@/lib/store";

/**
 * POST /api/posts/like
 * Body: { postId: string }
 * Header: Authorization: Bearer <token>
 * Toggles like on a post. Returns updated post.
 */
export async function POST(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to like posts." },
      { status: 401 }
    );
  }

  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required." },
        { status: 400 }
      );
    }

    const post = toggleLike(postId, user.id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
