import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type = "UPVOTE", articleId, commentId, slug } = body;

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

    if (!finalArticleId && !commentId) {
      return NextResponse.json({ error: "articleId or commentId required" }, { status: 400 });
    }

    const where: { userId: string; type: string; articleId?: string; commentId?: string } = {
      userId: session.user.id!,
      type,
    };

    if (finalArticleId) {
      where.articleId = finalArticleId;
    } else {
      where.commentId = commentId;
    }

    const existingReaction = await prisma.reaction.findFirst({
      where,
    });

    if (existingReaction) {
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
      return NextResponse.json({ status: "REMOVED" });
    } else {
      const reaction = await prisma.reaction.create({
        data: {
          type,
          userId: session.user.id!,
          articleId: finalArticleId,
          commentId,
        },
      });
      return NextResponse.json({ status: "CREATED", reaction });
    }
  } catch (error) {
    console.error("POST_REACTION_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
