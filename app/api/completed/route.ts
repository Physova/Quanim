import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: Return list of completed article slugs for the current user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ slugs: [] });
    }

    const completed = await prisma.completedArticle.findMany({
      where: { userId: session.user.id },
      select: { slug: true },
    });

    return NextResponse.json({
      slugs: completed.map((c) => c.slug),
    });
  } catch (error) {
    console.error("[COMPLETED_GET_ERROR]", error);
    return NextResponse.json({ slugs: [] });
  }
}

/**
 * POST: Mark an article as completed for the current user.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    await prisma.completedArticle.upsert({
      where: {
        userId_slug: {
          userId: session.user.id,
          slug,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMPLETED_POST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}
