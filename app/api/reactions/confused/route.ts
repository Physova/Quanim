import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const { articleSlug, paragraphId } = body;

  if (!articleSlug || !paragraphId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Ensure article exists in DB
    await prisma.article.upsert({
      where: { slug: articleSlug },
      update: {},
      create: { slug: articleSlug },
    });

    const userId = session?.user?.id || null;

    if (userId) {
      // For logged in users, upsert based on unique constraint
      const reaction = await prisma.confusedReaction.upsert({
        where: {
          userId_articleSlug_paragraphId: {
            userId,
            articleSlug,
            paragraphId,
          },
        },
        update: {},
        create: {
          userId,
          articleSlug,
          paragraphId,
        },
      });
      return NextResponse.json(reaction);
    } else {
      // For anonymous users, create a new record
      const reaction = await prisma.confusedReaction.create({
        data: {
          userId: null,
          articleSlug,
          paragraphId,
        },
      });
      return NextResponse.json(reaction);
    }
  } catch (error) {
    console.error("Confused reaction error:", error);
    return NextResponse.json({ error: "Failed to record reaction" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const counts = await prisma.confusedReaction.groupBy({
      by: ["paragraphId"],
      where: { articleSlug: slug },
      _count: {
        _all: true,
      },
    });

    // Transform into a simpler map: { "para-1": 5, "para-2": 2 }
    const result = counts.reduce((acc: Record<string, number>, curr) => {
      acc[curr.paragraphId] = curr._count._all;
      return acc;
    }, {});

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching confused counts:", error);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
