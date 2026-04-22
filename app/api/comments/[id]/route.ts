import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE: Soft-delete a comment.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the comment to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only author or admin can delete
    const userRole = session.user.role;
    if (comment.authorId !== session.user.id && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMMENT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * PUT: Update a comment's body.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { body: newText } = body;

    if (!newText) {
      return NextResponse.json({ error: "Body text is required" }, { status: 400 });
    }

    // Find the comment to verify ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only author can edit
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { body: newText },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("[COMMENT_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
