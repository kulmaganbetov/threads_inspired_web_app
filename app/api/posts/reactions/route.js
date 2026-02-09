import { NextResponse } from "next/server";
import { getUserByToken, setReaction, removeReaction } from "@/lib/store";

/**
 * POST /api/posts/reactions
 * Body: { postId: string, emoji: string }
 * Set or remove an emoji reaction on a post.
 * Sending the same emoji again removes it.
 */
export async function POST(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to react." },
      { status: 401 }
    );
  }

  try {
    const { postId, emoji } = await request.json();

    if (!postId || !emoji) {
      return NextResponse.json(
        { error: "postId and emoji are required." },
        { status: 400 }
      );
    }

    // If user already has this reaction, remove it (toggle)
    const post = setReaction(postId, user.id, emoji);
    if (!post) {
      // Try remove
      const removed = removeReaction(postId, user.id);
      if (!removed) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }
      return NextResponse.json({ post: removed });
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
