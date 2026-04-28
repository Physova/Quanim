import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureArticleExists } from "@/lib/actions/article";

const AUTHOR_SELECT = {
  id: true,
  name: true,
  image: true,
} as const;

/**
 * GET: Fetch threaded comments for an article by its slug.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        article: { slug },
      },
      include: {
        author: {
          select: AUTHOR_SELECT,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * POST: Create a new comment or reply.
 * Supports both authenticated users and anonymous guests.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { body: commentText, slug, parentId, guestId, guestName } = body;

    if (!commentText || !slug) {
      return NextResponse.json({ error: "Text and slug are required" }, { status: 400 });
    }

    // Must be either authenticated or have guest identity
    if (!session?.user?.id && (!guestId || !guestName)) {
      return NextResponse.json(
        { error: "Must be signed in or provide guest identity" },
        { status: 401 }
      );
    }

    const article = await ensureArticleExists(slug);

    const isAuthenticated = !!session?.user?.id;

    const comment = await prisma.comment.create({
      data: {
        body: commentText,
        parentId: parentId || null,
        articleId: article.id,
        ...(isAuthenticated ? {
          authorId: session!.user.id,
        } : {
          authorId: null,
          guestId: guestId as string,
          guestName: guestName as string,
        }),
      },
      include: {
        author: {
          select: AUTHOR_SELECT,
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
