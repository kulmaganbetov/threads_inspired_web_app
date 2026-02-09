import { NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { getAllPosts, addPost } from "@/lib/store";

/**
 * GET /api/posts
 * Returns all posts with their moderation labels, newest first.
 */
export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

/**
 * POST /api/posts
 * Creates a new post. The request body must include `text` and
 * optionally `author`. The mock ML classifier runs on the text
 * and the moderation result is attached to the post.
 *
 * Body: { text: string, author?: string }
 * Returns: the created post with moderation label + confidence.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { text, author } = body;

    // Validate input
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

    // Persist (in-memory)
    const post = addPost({
      text: text.trim(),
      author: author?.trim() || "Anonymous",
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
