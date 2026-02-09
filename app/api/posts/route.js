import { NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { getAllPosts, addPost, getUserByToken, isBlocked } from "@/lib/store";

/**
 * GET /api/posts
 * Returns all posts with moderation labels, likes, and comments.
 */
export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

/**
 * POST /api/posts
 * Creates a new post. Requires authentication.
 * Content is classified by mock ML. If classified as harmful
 * (Hate speech, Extremism, Cyberbullying, Fraud / Scam), the
 * post is BLOCKED and not saved.
 *
 * Header: Authorization: Bearer <token>
 * Body: { text: string }
 */
export async function POST(request) {
  // Auth check
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  const user = getUserByToken(token);

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to create a post." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Post text is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "Post text must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    // Run mock ML classification
    const moderation = classify(text);

    // Block harmful content
    if (isBlocked(moderation.label)) {
      return NextResponse.json(
        {
          error: `Post blocked by content moderation: classified as "${moderation.label}" (${Math.round(moderation.confidence * 100)}% confidence). This type of content is not allowed.`,
          moderation,
          blocked: true,
        },
        { status: 403 }
      );
    }

    // Persist (in-memory)
    const post = addPost({
      text: text.trim(),
      authorId: user.id,
      author: user.displayName,
      moderation,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
