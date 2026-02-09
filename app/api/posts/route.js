import { NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { getAllPosts, addPost, getUserByToken, isBlocked } from "@/lib/store";

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

/**
 * POST /api/posts
 * Body: { text: string, media?: string (base64 data URL) }
 */
export async function POST(request) {
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
    const { text, media } = body;

    if ((!text || typeof text !== "string" || text.trim().length === 0) && !media) {
      return NextResponse.json(
        { error: "Post must have text or an image." },
        { status: 400 }
      );
    }

    if (text && text.length > 500) {
      return NextResponse.json(
        { error: "Post text must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    // Validate media if provided (must be data URL, max ~5MB)
    if (media) {
      if (typeof media !== "string" || !media.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "Invalid image format." },
          { status: 400 }
        );
      }
      if (media.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be smaller than 5MB." },
          { status: 400 }
        );
      }
    }

    const moderation = text ? classify(text) : { label: "Neutral", confidence: 1.0 };

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

    const post = addPost({
      text: text?.trim() || "",
      authorId: user.id,
      author: user.displayName,
      moderation,
      media: media || null,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
