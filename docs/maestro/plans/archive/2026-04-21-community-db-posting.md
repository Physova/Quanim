# Community DB Posting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ephemeral thread creation with a Prisma-backed DB flow using a Modal (Dialog) component.

**Architecture:** Next.js App Router + Prisma (SQLite). Client-side state updates optimistically or via revalidation. Specialized agents handle DB, Logic, and UI Polish.

**Tech Stack:** Next.js 14, Prisma, Tailwind CSS, shadcn/ui Dialog, Framer Motion.

---

### Task 1: Architecture & API Contract

**Files:**
- Create: `app/api/community/threads/route.ts`
- Modify: `lib/community-data.ts` (if needed for types)

- [ ] **Step 1: Define POST endpoint contract.**
  - Input: `{ title: string, content: string }`
  - Auth: Require session (NextAuth).
  - Output: Created thread object.

- [ ] **Step 2: Create shell for API route.**

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { title, content } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  const thread = await prisma.thread.create({
    data: {
      title,
      authorId: user.id,
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true } }
    }
  });

  return NextResponse.json(thread);
}
```

---

### Task 2: UI Component - CreateThreadDialog

**Files:**
- Create: `components/social/create-thread-dialog.tsx`
- Modify: `components/social/community-hub.tsx`

- [ ] **Step 1: Implement Dialog using shadcn/ui.**
  - Use `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`.
  - Add form with `title` and `content`.
  - Style with "Physova" aesthetic (dark, white borders, mono labels).

- [ ] **Step 2: Replace `CreateThreadFullscreen` in `CommunityHub`.**
  - Import `CreateThreadDialog`.
  - Update `Initialize Discussion` button to trigger the dialog.
  - Update `handleCreateThread` to call the API.

---

### Task 3: Data Migration & Verification

**Files:**
- Modify: `prisma/schema.prisma` (Verify fields)
- Modify: `app/community/page.tsx` (Replace mock with DB fetch)

- [ ] **Step 1: Update Community Page to fetch from DB.**

```typescript
import { prisma } from "@/lib/prisma";
import { CommunityHub } from "@/components/social/community-hub";

export default async function CommunityPage() {
  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true } }
    }
  });

  return <CommunityHub initialThreads={threads} />;
}
```

- [ ] **Step 2: Verify build and runtime.**
  - Run `npx prisma generate`.
  - Run `npm run build`.
