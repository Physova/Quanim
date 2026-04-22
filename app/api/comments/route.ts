import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureArticleExists } from "@/lib/actions/article";

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

    // Comments are nested in DB but we'll fetch them all for a 2-level structure
    // Schema:parentId = null → top-level, parentId = ID → reply
    const comments = await prisma.comment.findMany({
      where: {
        article: { slug },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
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
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { body: commentText, slug, parentId } = body;

    if (!commentText || !slug) {
      return NextResponse.json({ error: "Text and slug are required" }, { status: 400 });
    }

    // Ensure the article exists in the DB
    const article = await ensureArticleExists(slug);

    const comment = await prisma.comment.create({
      data: {
        body: commentText,
        parentId: parentId || null,
        articleId: article.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
