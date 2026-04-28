import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE: Soft-delete a comment. Supports both authenticated users and guests.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const guestId = req.headers.get("x-guest-id");

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, guestId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check permission: author, admin, or matching guest
    const isAuthor = session?.user?.id && comment.authorId === session.user.id;
    const isAdmin = session?.user?.role === "ADMIN";
    const isGuestOwner = guestId && comment.guestId === guestId;

    if (!isAuthor && !isAdmin && !isGuestOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const { id } = await params;
    const body = await req.json();
    const { body: newText } = body;
    const guestId = req.headers.get("x-guest-id");

    if (!newText) {
      return NextResponse.json({ error: "Body text is required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true, guestId: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only author or guest owner can edit
    const isAuthor = session?.user?.id && comment.authorId === session.user.id;
    const isGuestOwner = guestId && comment.guestId === guestId;

    if (!isAuthor && !isGuestOwner) {
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
            username: true,
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
