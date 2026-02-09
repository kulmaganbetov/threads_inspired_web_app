import { NextResponse } from "next/server";
import { getUserByToken, addComment } from "@/lib/store";
import { classify } from "@/lib/classifier";

/**
 * POST /api/posts/comments
 * Body: { postId: string, text: string }
 * Header: Authorization: Bearer <token>
 * Adds a comment to a post. Comments are also moderated.
 */
export async function POST(request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to comment." },
      { status: 401 }
    );
  }

  try {
    const { postId, text } = await request.json();

    if (!postId || !text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "postId and non-empty text are required." },
        { status: 400 }
      );
    }

    if (text.length > 300) {
      return NextResponse.json(
        { error: "Comment must be 300 characters or fewer." },
        { status: 400 }
      );
    }

    // Moderate comment text
    const moderation = classify(text);
    const BLOCKED = ["Hate speech", "Extremism", "Cyberbullying", "Fraud / Scam"];
    if (BLOCKED.includes(moderation.label)) {
      return NextResponse.json(
        {
          error: `Comment blocked: classified as "${moderation.label}" (${Math.round(moderation.confidence * 100)}% confidence).`,
          moderation,
        },
        { status: 403 }
      );
    }

    const comment = addComment({
      postId,
      authorId: user.id,
      author: user.displayName,
      text: text.trim(),
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
