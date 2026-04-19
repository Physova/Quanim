import { NextResponse } from "next/server";

// Mock comments API — returns empty array for GET, mock response for POST
// Replace with Prisma queries once database is properly configured

export async function GET() {
  // Return empty comments array for now
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Return a mock comment for optimistic UI
    const mockComment = {
      id: `mock-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      parentId: body.parentId || null,
      author: {
        id: "mock-user",
        name: "Guest User",
        image: null,
      },
      _count: {
        reactions: 0,
      },
    };

    return NextResponse.json(mockComment);
  } catch (error) {
    console.error("POST_COMMENT_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
