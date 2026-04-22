# PHYSOVA — MEGA IMPLEMENTATION PLAN
### For Gemini CLI / Maestro Agent System
**Version:** 1.0 | **Authored by:** Claude Planner
**Status:** FINAL — Ready for Coder agent execution

---

> **AGENT INSTRUCTIONS:** You are the **Coder** agent. Read every word of this plan before writing a single line of code. Each phase must be completed and verified before the next begins. All file paths are relative to the project root (`C:\Users\Shubhadeep Roy\Downloads\Quanim-main\`). When in doubt, re-read the relevant section. Do NOT improvise architecture decisions — follow this plan exactly.

---

## SUPABASE CONNECTION (READ FIRST — USED EVERYWHERE)

These are the two connection strings for all database work.

```env
# .env.local — EXACT CONTENT (add your password where shown)

# For Prisma migrations (direct connection, bypasses pooler)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.sberxaxgigyfnrmwnaym.supabase.co:5432/postgres"

# For runtime queries (transaction pooler, IPv4-safe, serverless-safe)
DATABASE_URL="postgresql://postgres.sberxaxgigyfnrmwnaym:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Auth (keep existing values, just add these)
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

**Why two URLs?**
- `DATABASE_URL` = pooled connection via pgBouncer. Used by the running app. Required for serverless (Vercel).
- `DIRECT_URL` = direct TCP connection. Used ONLY by `prisma migrate` and `prisma db push`. Never used by the app at runtime.

---

## PHASE 1 — SUPABASE + PRISMA FOUNDATION
**Priority: CRITICAL BLOCKER. Nothing else works without this.**
**Estimated time: 2–3 hours**

### Step 1.1 — Update Prisma Schema

**File to edit:** `prisma/schema.prisma`

Replace the entire file content with the following. Do not keep any SQLite-specific syntax:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  comments Comment[]
  reactions Reaction[]
  confusedReactions ConfusedReaction[]
}

enum Role {
  USER
  ADMIN
}

// ─────────────────────────────────────────────
// NEXTAUTH TABLES (required by Prisma adapter)
// ─────────────────────────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────────────
// ARTICLES (MDX filesystem articles — tracked in DB for relations)
// ─────────────────────────────────────────────
model Article {
  id          String   @id @default(cuid())
  slug        String   @unique  // matches the MDX filename slug
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())

  comments    Comment[]
  reactions   Reaction[]
  confusedReactions ConfusedReaction[]
}

// ─────────────────────────────────────────────
// COMMENTS — 2-LEVEL THREADED
// ─────────────────────────────────────────────
// Depth rules:
//   parentId = null  → top-level comment (depth 0)
//   parentId = ID    → reply (depth 1)
// A reply to a depth-1 comment stays at depth 1 visually but
// tags the user with @username. Never store depth > 1 in DB.
model Comment {
  id        String   @id @default(cuid())
  body      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isDeleted Boolean  @default(false)  // soft delete, show "[deleted]"

  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  parentId  String?  // null = top level, non-null = reply
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
}

// ─────────────────────────────────────────────
// REACTIONS — Emoji reactions on articles
// ─────────────────────────────────────────────
model Reaction {
  id        String   @id @default(cuid())
  type      String   // e.g. "🔥", "🤯", "💡"
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId, type])  // one reaction per type per user per article
}

// ─────────────────────────────────────────────
// CONFUSED REACTIONS — "I got lost here" paragraph tracking
// ─────────────────────────────────────────────
model ConfusedReaction {
  id          String   @id @default(cuid())
  paragraphId String   // e.g. "para-3" — matches data-para-id on DOM element
  createdAt   DateTime @default(now())

  userId      String?  // nullable — allow anonymous reactions
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  articleSlug String
  article     Article  @relation(fields: [articleSlug], references: [slug], onDelete: Cascade)

  @@unique([userId, articleSlug, paragraphId])  // one confused-click per para per user
}

// ─────────────────────────────────────────────
// SIMULATION STATES — for shareable URL states
// ─────────────────────────────────────────────
model SimState {
  id        String   @id @default(cuid())
  simType   String   // e.g. "double-slit"
  params    Json     // serialized simulation parameters
  createdAt DateTime @default(now())
}

---

## PHASE 1 — SUPABASE + PRISMA FOUNDATION (Continued)

### Step 1.2 — Run the Migration
... (refer to implementation_plan.md) ...

### Step 1.3 — Update lib/prisma.ts
... (refer to implementation_plan.md) ...

### Step 1.4 — NextAuth Prisma Adapter
... (refer to implementation_plan.md) ...

### Step 1.5 — Install required packages
... (refer to implementation_plan.md) ...

---

## PHASE 2 — NAVIGATION SINGLE SOURCE OF TRUTH
... (refer to implementation_plan.md) ...

---

## PHASE 3 — CONTENT PIPELINE (SINGERBOY'S WORKFLOW)
... (refer to implementation_plan.md) ...

---

## PHASE 4 — READING EXPERIENCE UPGRADES
... (refer to implementation_plan.md) ...

---

## PHASE 5 — THREADED COMMENTS SYSTEM
... (refer to implementation_plan.md) ...

---

## PHASE 6 — \"CONFUSED HERE\" PARAGRAPH TRACKING
... (refer to implementation_plan.md) ...

---

## PHASE 7 — SHAREABLE SIMULATION URLS
... (refer to implementation_plan.md) ...

---

## PHASE 8 — \"SIMULATE THIS EQUATION\" INTERACTION
... (refer to implementation_plan.md) ...

---

## PHASE 9 — COMMUNITY TAB REMOVAL
... (refer to implementation_plan.md) ...
