import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get("articleId");
  const threadId = searchParams.get("threadId");
  const slug = searchParams.get("slug");

  try {
    const where: { articleId?: string; threadId?: string } = {};

    if (slug) {
      const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      where.articleId = article.id;
    } else if (articleId) {
      where.articleId = articleId;
    } else if (threadId) {
      where.threadId = threadId;
    } else {
      return NextResponse.json({ error: "articleId or threadId required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET_COMMENTS_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, articleId, threadId, parentId, slug } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let finalArticleId = articleId;

    if (slug && !articleId) {
      const article = await prisma.article.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!article) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      finalArticleId = article.id;
    }

    if (!finalArticleId && !threadId) {
      return NextResponse.json({ error: "articleId or threadId required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id!,
        articleId: finalArticleId,
        threadId,
        parentId,
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
    console.error("POST_COMMENT_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
