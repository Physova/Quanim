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

# For runtime queries (session pooler, port 5432 — works for both app and Prisma CLI)
DATABASE_URL="postgresql://postgres.sberxaxgigyfnrmwnaym:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# For Prisma migrations (direct connection, bypasses pooler entirely)
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.sberxaxgigyfnrmwnaym.supabase.co:5432/postgres"

# Auth (keep existing values, just add these)
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

**Why two URLs?**
- `DATABASE_URL` = session pooler (port 5432). Used by the running app and Prisma CLI. Works everywhere including serverless (Vercel). **DO NOT use port 6543** (transaction pooler) — Prisma CLI hangs on it.
- `DIRECT_URL` = direct TCP connection. Used ONLY by `prisma migrate` and `prisma db push` internally. Never used by the app at runtime.

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
```

### Step 1.2 — Run the Migration

Execute these commands in order from the project root:

```bash
# 1. Install pgBouncer-safe deps if not already present
npm install @prisma/client
npm install --save-dev prisma

# 2. Push schema to Supabase (uses DIRECT_URL internally)
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. Verify: open Prisma Studio to visually confirm tables exist
npx prisma studio
```

**Expected result:** Prisma Studio opens at `localhost:5555`. You should see tables: User, Account, Session, Article, Comment, Reaction, ConfusedReaction, SimState. If any table is missing, the migration failed — re-check `.env.local` password.

### Step 1.3 — Update lib/prisma.ts

**File:** `lib/prisma.ts` — replace entire content:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Step 1.4 — NextAuth Prisma Adapter

**File:** `lib/auth.ts` (create if it doesn't exist, or update existing auth config):

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "database",  // store sessions in Supabase, not JWTs
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as any).role ?? "USER";
      return session;
    },
  },
});
```

**File:** `app/api/auth/[...nextauth]/route.ts` — update to:

```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Step 1.5 — Install required packages

```bash
npm install @auth/prisma-adapter
npm install next-auth@beta
```

**Verify Phase 1 complete:** Run `npm run dev`. The app should start without DB errors. Check terminal for Prisma connection errors. If you see `PrismaClientInitializationError`, the DATABASE_URL is wrong — check password.

---

## PHASE 2 — NAVIGATION SINGLE SOURCE OF TRUTH
**Priority: HIGH** | **Status: ✅ ALREADY COMPLETE**
**Estimated time: 45 minutes**

### Step 2.1 — Create Navigation Config

**Create new file:** `config/navigation.ts`

```typescript
// config/navigation.ts
export interface NavLink {
  label: string;
  href: string;
  description?: string; // used in mobile nav dropdown
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", description: "Back to the beginning" },
  { label: "Topics", href: "/topics", description: "Explore physics articles" },
  // Community is intentionally removed from nav.
  // The code at /community still exists for future use.
  // To re-enable: uncomment the line below.
  // { label: "Community", href: "/community", description: "Discuss physics" },
];

export const SOCIAL_LINKS = {
  x: "https://x.com/physova",
};
```

### Step 2.2 — Update Desktop Header

**File:** `components/` — find the desktop header/navbar component (likely `components/layout/header.tsx` or similar — check actual filename).

Replace whatever hardcoded link array exists with:

```typescript
import { NAV_LINKS, SOCIAL_LINKS } from "@/config/navigation";
```

Then map over `NAV_LINKS` to render links instead of any hardcoded `<Link>` elements.

Add X/Twitter social link using `SOCIAL_LINKS.x`:

```tsx
<a
  href={SOCIAL_LINKS.x}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Follow Physova on X"
  className="text-white/60 hover:text-white transition-colors"
>
  {/* X/Twitter SVG icon */}
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
</a>
```

### Step 2.3 — Fix Mobile Navbar

**File:** Find the mobile navbar component. It is likely in one of:
- `components/layout/mobile-nav.tsx`
- `components/ui/mobile-menu.tsx`
- `components/visuals/mobile-navbar.tsx`

Search for whichever file contains a Framer Motion `AnimatePresence` or `motion.div` with mobile nav links.

Replace the entire links section with:

```tsx
import { NAV_LINKS, SOCIAL_LINKS } from "@/config/navigation";

// Replace the hardcoded <ul> with:
<ul className="space-y-4">
  {NAV_LINKS.map((link) => (
    <li key={link.href}>
      <Link
        href={link.href}
        className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
      >
        {link.label}
      </Link>
    </li>
  ))}
</ul>
```

Also update the social links section to use `SOCIAL_LINKS.x` instead of hardcoded `https://twitter.com`.

**Verify Phase 2 complete:** Footer navigation should match navbar links exactly. Community link should be gone from footer. Social links should point to actual Physova accounts.

---

## PHASE 3 — CONTENT PIPELINE (SINGERBOY'S WORKFLOW)
**Priority: HIGH**
**Estimated time: 3–4 hours**

This is the most important developer experience feature. SingerBoy writes `.md` files. Our compiler transforms them into valid `.mdx` files automatically.

### Step 3.1 — Define SingerBoy's Writing Format

**Create new file:** `content/WRITING_GUIDE.md` (this is for SingerBoy to read, not compiled)

```markdown
# How to Write a Physova Article
## (SingerBoy's Guide — No coding needed)

### Step 1: Create your file
Create a new file in `content/drafts/` folder.
Name it like: `quantum-gravity.md`
(use dashes, no spaces, all lowercase)

### Step 2: Fill in the header (copy-paste this every time)

---
title: "Your Article Title Here"
description: "One sentence about what this article covers."
tags: ["quantum", "gravity"]
difficulty: "Beginner"
---

Difficulty options: "Beginner", "Intermediate", "Advanced"

### Step 3: Write your article in normal Markdown

## Section Heading

This is a normal paragraph. Write whatever you want.

**Bold text** like this.
*Italic text* like this.

- Bullet point 1
- Bullet point 2

### Step 4: Add a simulation (when you want one)

When you want an interactive physics simulation, write:

[[ SIMULATION: double-slit ]]
[[ SIMULATION: superposition ]]
[[ SIMULATION: entanglement ]]
[[ SIMULATION: gravity-well ]]

Available simulations — use EXACTLY these names:
- double-slit
- superposition
- entanglement
- gravity-well

If you want a NEW simulation that doesn't exist yet,
tell Shubhadeep and he will create it using the Gemini CLI.

### Step 5: Add a quiz (optional)

[[ QUIZ: What is the speed of light? | 3×10⁸ m/s | 3×10⁶ m/s | 3×10¹⁰ m/s | 3×10⁸ m/s ]]

Format: [[ QUIZ: Question? | Option1 | Option2 | Option3 | CorrectAnswer ]]
The last item after | is ALWAYS the correct answer.

### Step 6: Add a callout box (optional)

[[ CALLOUT: info | This is an info box. Write something important here. ]]
[[ CALLOUT: warning | Be careful about this concept. ]]
[[ CALLOUT: fun | Fun physics fact goes here! ]]

### Step 7: Write equations (optional)

For inline equations: $E = mc^2$
For block equations (centered, large):

$$
\hat{H}\psi = E\psi
$$

### Step 8: Save and tell Shubhadeep

Save the file in `content/drafts/`.
Tell Shubhadeep it's ready.
He runs one command and it's live on the website.
```

### Step 3.2 — Create the Compiler Script

**Create new file:** `scripts/compile-content.ts`

```typescript
// scripts/compile-content.ts
// Run with: npx ts-node scripts/compile-content.ts
// Or: npm run compile:content (after adding to package.json)

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DRAFTS_DIR = path.join(process.cwd(), "content/drafts");
const OUTPUT_DIR = path.join(process.cwd(), "content/topics");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Calculate reading time
function estimateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Process shortcodes into MDX components
function processShortcodes(content: string): string {
  let processed = content;

  // [[ SIMULATION: type ]] → <Lab type="type" />
  processed = processed.replace(
    /\[\[\s*SIMULATION:\s*([a-z-]+)\s*\]\]/g,
    (_, type) =>
      `\n<Lab\n  type="${type}"\n  title="Interactive ${capitalize(type)} Simulation"\n  description="Explore the ${type.replace(/-/g, " ")} phenomenon interactively."\n/>\n`
  );

  // [[ QUIZ: Q? | A | B | C | Correct ]] → <Quiz /> component
  processed = processed.replace(
    /\[\[\s*QUIZ:\s*(.+?)\s*\]\]/g,
    (_, inner) => {
      const parts = inner.split("|").map((s: string) => s.trim());
      const question = parts[0];
      const correct = parts[parts.length - 1];
      const options = parts.slice(1, -1);
      const optionsJson = JSON.stringify(options);
      return `\n<Quiz\n  question="${escapeQuotes(question)}"\n  options={${optionsJson}}\n  answer="${escapeQuotes(correct)}"\n/>\n`;
    }
  );

  // [[ CALLOUT: type | text ]] → <Callout type="type">text</Callout>
  processed = processed.replace(
    /\[\[\s*CALLOUT:\s*(info|warning|fun)\s*\|\s*(.+?)\s*\]\]/g,
    (_, type, text) =>
      `\n<Callout type="${type}">\n${text}\n</Callout>\n`
  );

  return processed;
}

function capitalize(str: string): string {
  return str.replace(/(^|\s|-)\w/g, (c) => c.toUpperCase()).replace(/-/g, " ");
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

function generateSlug(filename: string): string {
  return filename.replace(/\.md$/, "");
}

// Main compilation
const draftFiles = fs.readdirSync(DRAFTS_DIR).filter((f) => f.endsWith(".md"));

if (draftFiles.length === 0) {
  console.log("📭 No draft files found in content/drafts/");
  process.exit(0);
}

let compiled = 0;
let errors = 0;

for (const filename of draftFiles) {
  try {
    const filePath = path.join(DRAFTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const slug = generateSlug(filename);
    const readTime = estimateReadTime(content);
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Validate required frontmatter
    if (!frontmatter.title) {
      console.error(`❌ ${filename}: Missing required frontmatter field: title`);
      errors++;
      continue;
    }

    // Build complete frontmatter
    const completeFrontmatter = {
      title: frontmatter.title,
      slug,
      description: frontmatter.description ?? "",
      tags: frontmatter.tags ?? [],
      publishedAt: frontmatter.publishedAt ?? now,
      difficulty: frontmatter.difficulty ?? "Beginner",
      readTime,
    };

    // Process shortcodes in content
    const processedContent = processShortcodes(content);

    // Build final MDX
    const frontmatterYaml = Object.entries(completeFrontmatter)
      .map(([k, v]) =>
        Array.isArray(v)
          ? `${k}: [${v.map((i) => `"${i}"`).join(", ")}]`
          : typeof v === "string"
          ? `${k}: "${v}"`
          : `${k}: ${v}`
      )
      .join("\n");

    const finalMdx = `---\n${frontmatterYaml}\n---\n\n${processedContent}`;

    const outputPath = path.join(OUTPUT_DIR, `${slug}.mdx`);
    fs.writeFileSync(outputPath, finalMdx);

    console.log(`✅ Compiled: ${filename} → ${slug}.mdx (${readTime} min read)`);
    compiled++;
  } catch (err) {
    console.error(`❌ Failed to compile ${filename}:`, err);
    errors++;
  }
}

console.log(`\n📦 Done: ${compiled} compiled, ${errors} errors.`);
```

### Step 3.3 — Add to package.json scripts

**File:** `package.json` — add to the `"scripts"` section:

```json
{
  "scripts": {
    "compile:content": "npx ts-node --project tsconfig.json scripts/compile-content.ts",
    "new:topic": "node scripts/new-topic.js"
  }
}
```

Also create a quick scaffolding helper. **Create:** `scripts/new-topic.js`

```javascript
// scripts/new-topic.js
// Usage: node scripts/new-topic.js my-article-slug
const fs = require("fs");
const path = require("path");

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: node scripts/new-topic.js your-article-slug");
  process.exit(1);
}

const filename = `${slug}.md`;
const outputPath = path.join(process.cwd(), "content/drafts", filename);

if (fs.existsSync(outputPath)) {
  console.error(`File already exists: ${filename}`);
  process.exit(1);
}

fs.mkdirSync(path.join(process.cwd(), "content/drafts"), { recursive: true });

const today = new Date().toISOString().split("T")[0];
const template = `---
title: "Your Title Here"
description: "One sentence description."
tags: ["physics"]
difficulty: "Beginner"
publishedAt: "${today}"
---

## Introduction

Write your introduction here.

## Main Section

Your content goes here.

[[ SIMULATION: double-slit ]]

## Conclusion

Wrap it up here.
`;

fs.writeFileSync(outputPath, template);
console.log(`✅ Created: content/drafts/${filename}`);
console.log(`   Open it in VSCode or Obsidian and start writing!`);
```

### Step 3.4 — Install gray-matter dependency

```bash
npm install gray-matter
npm install --save-dev ts-node
```

**Verify Phase 3 complete:** Create a test file `content/drafts/test-article.md` with the template format. Run `npm run compile:content`. Verify `content/topics/test-article.mdx` is generated with proper frontmatter, `<Lab />`, and `<Quiz />` components embedded. Delete the test files after verification.

---

## PHASE 4 — READING EXPERIENCE UPGRADES
**Priority: HIGH**
**Estimated time: 3 hours**

### Step 4.1 — Reading Progress Bar

**Create new file:** `components/ui/reading-progress.tsx`

```tsx
// components/ui/reading-progress.tsx
"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, percent)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-white/5">
      <div
        className="h-full bg-white/80 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

**Where to use:** Add `<ReadingProgress />` inside `app/topics/[slug]/page.tsx` at the top level of the article page component. It is a client component so it must be imported into a client boundary or placed in a client layout.

### Step 4.2 — KaTeX Math Rendering

Install:
```bash
npm install rehype-katex remark-math katex
```

**File:** `lib/mdx.ts` — update the MDX plugins configuration to include:

```typescript
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// Add to your MDX options wherever remark/rehype plugins are configured:
// remarkPlugins: [remarkMath, ...existing plugins]
// rehypePlugins: [rehypeKatex, ...existing plugins]
```

**File:** `app/topics/[slug]/page.tsx` — add KaTeX CSS import at top:

```typescript
import "katex/dist/katex.min.css";
```

### Step 4.3 — Difficulty Badges Component

**Create:** `components/ui/difficulty-badge.tsx`

```tsx
// components/ui/difficulty-badge.tsx
import { cn } from "@/lib/utils";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const styles: Record<Difficulty, string> = {
  Beginner:
    "bg-white/5 text-white/60 border border-white/10",
  Intermediate:
    "bg-white/5 text-white/60 border border-white/15",
  Advanced:
    "bg-white/10 text-white/80 border border-white/20",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
        styles[difficulty] ?? styles.Beginner
      )}
    >
      {difficulty}
    </span>
  );
}
```

**Where to use:** In `app/topics/[slug]/page.tsx` article header, and in `app/topics/page.tsx` topic cards. Pass `frontmatter.difficulty` as the prop.

### Step 4.4 — Estimated Read Time Display

The `compile-content.ts` script already calculates `readTime` and adds it to frontmatter.

In the article page header, add:

```tsx
<div className="flex items-center gap-3 text-sm text-white/50">
  <span>{frontmatter.readTime} min read</span>
  <span>·</span>
  <DifficultyBadge difficulty={frontmatter.difficulty} />
</div>
```

### Step 4.5 — Related Articles Section

**Create:** `components/content/related-articles.tsx`

```tsx
// components/content/related-articles.tsx
import Link from "next/link";
import { getAllTopics } from "@/lib/mdx"; // use your existing MDX utility

interface RelatedArticlesProps {
  currentSlug: string;
  currentTags: string[];
}

export async function RelatedArticles({
  currentSlug,
  currentTags,
}: RelatedArticlesProps) {
  const allTopics = await getAllTopics();

  // Score each article by tag overlap
  const related = allTopics
    .filter((topic) => topic.frontmatter.slug !== currentSlug)
    .map((topic) => {
      const overlapCount = (topic.frontmatter.tags ?? []).filter((tag: string) =>
        currentTags.includes(tag)
      ).length;
      return { ...topic, overlapCount };
    })
    .filter((t) => t.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .slice(0, 3); // show max 3 related articles

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-white/10">
      <h2 className="text-lg font-semibold text-white mb-6">Related Topics</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((topic) => (
          <Link
            key={topic.frontmatter.slug}
            href={`/topics/${topic.frontmatter.slug}`}
            className="group p-4 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors line-clamp-2">
              {topic.frontmatter.title}
            </h3>
            <p className="text-xs text-white/40 mt-1 line-clamp-2">
              {topic.frontmatter.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

**Where to use:** Add `<RelatedArticles currentSlug={slug} currentTags={frontmatter.tags} />` at the bottom of `app/topics/[slug]/page.tsx`, before the comments section.

---

## PHASE 5 — THREADED COMMENTS SYSTEM
**Priority: HIGH**
**Estimated time: 4–5 hours**

### Step 5.1 — Article Upsert Helper

Before a comment can be created for an article, that article must exist in the DB. Since our articles are filesystem-based (MDX), we need to auto-create the `Article` DB record on first view.

**Create:** `lib/actions/article.ts`

```typescript
// lib/actions/article.ts
"use server";
import { prisma } from "@/lib/prisma";

export async function ensureArticleExists(slug: string): Promise<string> {
  const article = await prisma.article.upsert({
    where: { slug },
    create: { slug },
    update: {}, // do nothing if exists
  });
  return article.id;
}
```

Call `ensureArticleExists(slug)` in `app/topics/[slug]/page.tsx` at the start of the page render.

### Step 5.2 — Comments API Routes

**Create:** `app/api/comments/route.ts` (replace existing if present)

```typescript
// app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/comments?articleSlug=xxx
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("articleSlug");
  if (!slug) return NextResponse.json({ error: "Missing articleSlug" }, { status: 400 });

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return NextResponse.json({ comments: [] });

  // Fetch top-level comments with their replies (max 1 level deep)
  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
      parentId: null, // top-level only
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        where: { isDeleted: false },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

const CreateCommentSchema = z.object({
  articleSlug: z.string().min(1),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional(), // undefined = top-level comment
});

// POST /api/comments
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error }, { status: 400 });
  }

  const { articleSlug, body: commentBody, parentId } = parsed.data;

  const article = await prisma.article.findUnique({ where: { slug: articleSlug } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Depth check: if parentId provided, ensure parent is top-level (depth 0)
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    if (parent.parentId !== null) {
      // Parent is already a reply — we allow it but store it at depth 1 still
      // The UI shows it as a reply to the thread, not nested further
    }
  }

  const comment = await prisma.comment.create({
    data: {
      body: commentBody,
      authorId: session.user.id,
      articleId: article.id,
      parentId: parentId ?? null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
```

**Create:** `app/api/comments/[id]/route.ts`

```typescript
// app/api/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/comments/:id (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = (session.user as any).role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.update({
    where: { id: params.id },
    data: { isDeleted: true },
  });

  return NextResponse.json({ success: true });
}
```

### Step 5.3 — Comments UI Component

**Create:** `components/social/comments-section.tsx`

```tsx
// components/social/comments-section.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  isDeleted: boolean;
  author: Author;
  replies?: Comment[];
}

interface CommentsSectionProps {
  articleSlug: string;
}

export function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  async function fetchComments() {
    setLoading(true);
    const res = await fetch(`/api/comments?articleSlug=${articleSlug}`);
    const data = await res.json();
    setComments(data.comments ?? []);
    setLoading(false);
  }

  async function submitComment(body: string, parentId?: string) {
    if (!body.trim()) return;
    setSubmitting(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleSlug, body: body.trim(), parentId }),
    });
    await fetchComments();
    setNewComment("");
    setReplyBody("");
    setReplyingTo(null);
    setSubmitting(false);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function CommentCard({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) {
    return (
      <div className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}>
        {comment.author.image ? (
          <Image
            src={comment.author.image}
            alt={comment.author.name ?? "User"}
            width={32}
            height={32}
            className="flex-shrink-0 w-8 h-8"
          />
        ) : (
          <div className="w-8 h-8 bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white/50">
            {(comment.author.name ?? "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">
              {comment.author.name ?? "Anonymous"}
            </span>
            <span className="text-xs text-white/30">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          {comment.isDeleted ? (
            <p className="text-sm text-white/30 italic">[deleted]</p>
          ) : (
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {comment.body}
            </p>
          )}
          {!comment.isDeleted && !isReply && session && (
            <button
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className="text-xs text-white/30 hover:text-white/60 mt-1 transition-colors"
            >
              {replyingTo === comment.id ? "Cancel" : "Reply"}
            </button>
          )}
          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-white/30"
                rows={2}
              />
              <button
                onClick={() => submitComment(replyBody, comment.id)}
                disabled={submitting || !replyBody.trim()}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors"
              >
                Post
              </button>
            </div>
          )}
          {/* Replies */}
          {(comment.replies ?? []).map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-16 pt-8 border-t border-white/10">
      <h2 className="text-lg font-semibold text-white mb-8">
        Discussion
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-white/40">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* New comment input */}
      {session ? (
        <div className="flex gap-3 mb-10">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="You"
              width={32}
              height={32}
              className="flex-shrink-0 w-8 h-8 mt-1"
            />
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the discussion..."
              className="w-full bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-white/30 transition-colors"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => submitComment(newComment)}
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/10 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 border border-white/10 bg-white/[0.02] text-center">
          <p className="text-sm text-white/50">
            Sign in to join the discussion
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-24" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">
          No comments yet. Be the first to start a discussion.
        </p>
      ) : (
        <div className="space-y-8">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
}
```

**Install zod if not present:**
```bash
npm install zod
```

---

## PHASE 6 — "CONFUSED HERE" PARAGRAPH TRACKING
**Priority: MEDIUM**
**Estimated time: 2–3 hours**

### Step 6.1 — API Route

**Create:** `app/api/confused/route.ts`

```typescript
// app/api/confused/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  articleSlug: z.string().min(1),
  paragraphId: z.string().min(1),
});

// GET /api/confused?articleSlug=xxx → return counts per paragraph
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("articleSlug");
  if (!slug) return NextResponse.json({ counts: {} });

  const reactions = await prisma.confusedReaction.groupBy({
    by: ["paragraphId"],
    where: { articleSlug: slug },
    _count: { paragraphId: true },
  });

  const counts: Record<string, number> = {};
  reactions.forEach((r) => {
    counts[r.paragraphId] = r._count.paragraphId;
  });

  return NextResponse.json({ counts });
}

// POST /api/confused
export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { articleSlug, paragraphId } = parsed.data;

  // Ensure article exists
  await prisma.article.upsert({
    where: { slug: articleSlug },
    create: { slug: articleSlug },
    update: {},
  });

  await prisma.confusedReaction.upsert({
    where: {
      userId_articleSlug_paragraphId: {
        userId: session?.user?.id ?? "anonymous",
        articleSlug,
        paragraphId,
      },
    },
    create: {
      userId: session?.user?.id ?? null,
      articleSlug,
      paragraphId,
    },
    update: {}, // already voted — no-op
  });

  return NextResponse.json({ success: true });
}
```

### Step 6.2 — Confused Button Component

**Create:** `components/content/confused-button.tsx`

```tsx
// components/content/confused-button.tsx
"use client";

import { useState } from "react";

interface ConfusedButtonProps {
  articleSlug: string;
  paragraphId: string;
  initialCount?: number;
}

export function ConfusedButton({
  articleSlug,
  paragraphId,
  initialCount = 0,
}: ConfusedButtonProps) {
  const [clicked, setClicked] = useState(false);
  const [count, setCount] = useState(initialCount);

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    setCount((c) => c + 1);
    await fetch("/api/confused", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleSlug, paragraphId }),
    });
  }

  return (
    <button
      onClick={handleClick}
      title="I got confused here"
      className={`
        opacity-0 group-hover:opacity-100 focus:opacity-100
        inline-flex items-center gap-1 ml-2 px-1.5 py-0.5
        text-xs transition-all duration-200
        ${clicked
          ? "text-white/80 bg-white/10"
          : "text-white/20 hover:text-white/60 hover:bg-white/5"
        }
      `}
    >
      <span>?</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
```

**How to use in MDX article render:**

In `mdx-components.tsx` (or wherever custom MDX components are defined), wrap each `<p>` with a group container and attach the ConfusedButton:

```tsx
// In mdx-components.tsx
let paraIndex = 0;

p: ({ children }) => {
  const id = `para-${paraIndex++}`;
  return (
    <div className="group relative">
      <p className="..." data-para-id={id}>
        {children}
        <ConfusedButton articleSlug={/* pass from context */} paragraphId={id} />
      </p>
    </div>
  );
},
```

> **Note to Coder:** Passing `articleSlug` to the MDX `p` component requires either a React context or a wrapper provider. Create a `ArticleSlugContext` and wrap the MDX render output with it. This is the cleanest approach.

---

## PHASE 7 — SHAREABLE SIMULATION URLS
**Priority: MEDIUM**
**Estimated time: 2 hours**

### Step 7.1 — URL State Serialization in Zustand Store

**File:** `lib/stores/simulation-store.ts` — add URL sync:

```typescript
// Add this to the existing simulation store

import { useEffect } from "react";

// Call this hook inside the simulation component
export function useSimUrlSync(simType: string) {
  const params = useSimulationStore((state) => state.params); // adjust selector to match your store shape

  // Write state to URL on change
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("sim", simType);
    url.searchParams.set("params", btoa(JSON.stringify(params)));
    window.history.replaceState({}, "", url.toString());
  }, [params, simType]);

  // Read state from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("params");
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        useSimulationStore.getState().setParams(decoded); // adjust to match your store's setter
      } catch (e) {
        // Invalid URL params — ignore
      }
    }
  }, []);
}
```

Add a "Share Simulation" button to `LabContainer`:

```tsx
// Inside lab-container.tsx, add a share button
function ShareButton() {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copyLink}
      className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 transition-colors"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
      </svg>
      {copied ? "Copied!" : "Share simulation"}
    </button>
  );
}
```

---

## PHASE 8 — "SIMULATE THIS EQUATION" INTERACTION
**Priority: LOW**
**Estimated time: 1.5 hours**

### Step 8.1 — Equation-to-Simulation Mapping

**Create:** `lib/equation-sim-map.ts`

```typescript
// lib/equation-sim-map.ts
// Maps equation identifiers to simulation types
// When an equation with this ID is in the article,
// the ⚡ button will open the relevant simulation.

export const EQUATION_SIM_MAP: Record<string, string> = {
  "schrodinger": "superposition",
  "double-slit-interference": "double-slit",
  "bell-inequality": "entanglement",
  "uncertainty-principle": "superposition",
};

export type SimType = "double-slit" | "superposition" | "entanglement" | "gravity-well";
```

### Step 8.2 — Equation Component with Sim Button

**Create:** `components/content/equation-block.tsx`

```tsx
// components/content/equation-block.tsx
"use client";

import { useState } from "react";

interface EquationBlockProps {
  children: React.ReactNode;
  simType?: string; // if provided, show the ⚡ button
  equationId?: string;
}

export function EquationBlock({ children, simType }: EquationBlockProps) {
  const [highlight, setHighlight] = useState(false);

  function scrollToSim() {
    // The Lab component on this page should have id={`lab-${simType}`}
    const el = document.getElementById(`lab-${simType}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlight(true);
      setTimeout(() => setHighlight(false), 2000);
    }
  }

  return (
    <div className="relative group my-6">
      <div className="p-6 bg-white/[0.03] border border-white/10 text-center font-serif">
        {children}
      </div>
      {simType && (
        <button
          onClick={scrollToSim}
          title="Simulate this equation"
          className="absolute -right-3 -top-3 w-7 h-7 bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/60 text-xs transition-all opacity-0 group-hover:opacity-100"
        >
          ⚡
        </button>
      )}
    </div>
  );
}
```

Add `id={`lab-${type}`}` to `LabContainer` so the scroll target works.

---

## PHASE 9 — COMMUNITY TAB REMOVAL
**Priority: HIGH** | **Status: ✅ ALREADY COMPLETE**
**Estimated time: 5 minutes**

This was covered in Phase 2 (navigation config). The only additional step:

**File:** `app/community/page.tsx` — add this at the top of the component:

```tsx
// Temporarily unlisted from nav.
// The page still exists and works, just not linked.
// Re-enable by adding it back to config/navigation.ts
```

Do NOT delete the file. Do NOT return a 404. Just unlink it.

---

## ENVIRONMENT SETUP CHECKLIST
**For Coder agent: complete all before running `npm run dev`**

- [ ] `.env.local` created with both `DATABASE_URL` (pooler) and `DIRECT_URL` (direct)
- [ ] Both URLs have the correct password replacing `[YOUR-PASSWORD]`
- [ ] `npx prisma db push` executed successfully
- [ ] `npx prisma generate` executed successfully
- [ ] `npm install` run after all new packages added
- [ ] `npm run dev` starts without console errors

---

## PACKAGE INSTALL SUMMARY
Run this single command to install everything needed across all phases:

```bash
npm install @auth/prisma-adapter next-auth@beta zod gray-matter rehype-katex remark-math katex
npm install --save-dev ts-node @types/node
```

---

## FILE CREATION SUMMARY
New files to create (does not exist yet):

| File | Phase |
|------|-------|
| `config/navigation.ts` | 2 |
| `scripts/compile-content.ts` | 3 |
| `scripts/new-topic.js` | 3 |
| `content/drafts/` (directory) | 3 |
| `content/WRITING_GUIDE.md` | 3 |
| `components/ui/reading-progress.tsx` | 4 |
| `components/ui/difficulty-badge.tsx` | 4 |
| `components/content/related-articles.tsx` | 4 |
| `components/social/comments-section.tsx` | 5 |
| `app/api/comments/route.ts` | 5 |
| `app/api/comments/[id]/route.ts` | 5 |
| `lib/actions/article.ts` | 5 |
| `components/content/confused-button.tsx` | 6 |
| `app/api/confused/route.ts` | 6 |
| `lib/equation-sim-map.ts` | 8 |
| `components/content/equation-block.tsx` | 8 |

---


---

## FINAL PRIORITY ORDER FOR CODER AGENT

```
EXECUTE IN THIS EXACT ORDER:

[1] Phase 1 — Supabase + Prisma         ← BLOCKER FOR EVERYTHING
[2] Phase 2 — Navigation fix            ← Quick win, high visibility
[3] Phase 9 — Remove Community from nav ← 5 minutes, do with Phase 2
[4] Phase 3 — Content Pipeline          ← SingerBoy can start writing
[5] Phase 4 — Reading experience UX     ← Article quality upgrades
[6] Phase 5 — Comments system           ← Requires Phase 1 complete
[7] Phase 6 — Confused Here tracking    ← Requires Phase 5
[8] Phase 7 — Shareable sim URLs        ← Independent, do when free
[9] Phase 8 — Simulate this equation    ← Polish feature, last
```

---

*Plan authored by Claude Planner. All architecture decisions final unless explicitly overridden by project owner (Shubhadeep). Coder agent should not deviate from this plan without flagging the deviation.*