import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 })
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(thread)
  } catch (error) {
    console.error("[THREADS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
