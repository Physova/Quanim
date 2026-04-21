# Physova Content Pages — Full Implementation Plan

## Problem Statement

The landing page is done. **Every other link throws an error.** The root causes are:

1. **`/community` crashes** — server-side `prisma.thread.findMany()` fails because SQLite DB has no tables (migrations never ran)
2. **`/topics` crashes** — `getAllTopics()` works (reads MDX files), but the page component has issues with Framer Motion SSR
3. **`/topics/[slug]` crashes** — `dynamic(() => import('@/content/topics/${slug}.mdx'))` uses a variable in the import path, which Webpack/Turbopack cannot resolve at build time
4. **`/auth/signin` & `/auth/signup`** — these pages don't exist at all (navbar links to them)
5. **`/community/[threadId]`** — crashes because it also uses Prisma which has no DB tables
6. **Simulations** — `lab-container.tsx` uses `@react-three/fiber` Canvas for the double-slit sim, which is the only legit R3F usage. Only the double-slit sim is implemented; superposition and entanglement return `null`.

> [!IMPORTANT]
> **Backend Strategy Decision:** The Prisma schema already exists for SQLite. The crash is caused by (a) missing tables and (b) the unnecessary `@prisma/adapter-libsql` layer in `lib/prisma.ts`. **Fix: simplify `prisma.ts` to use standard PrismaClient, run `npx prisma db push`, and seed a few test threads.** This gives a real working DB — not mock data — so it works properly when sharing with friends.

---

## Agent Decisions (Answers to Design Questions)

1. **Mock Data Scope:** NOT using mock data at all. Instead, simplify `lib/prisma.ts` (remove LibSQL adapter), run `npx prisma db push` to sync schema → SQLite, then seed with `prisma/seed.ts`. Community pages use real Prisma queries.
2. **Auth Page Logic:** UI shells only for Phase 1. Google OAuth credentials are placeholders (`google_client_id_placeholder`). Build beautiful sign-in/sign-up pages with styled but inert OAuth buttons + a "Google OAuth setup required" note. NextAuth flow can be wired up later with real credentials.
3. **Simulation Strategy:** Pure HTML Canvas 2D Context API. No pixi.js, no p5.js. Port the rendering logic from the old `.js` files into React `useEffect` + `useRef<HTMLCanvasElement>` components.
4. **Landing Navbar:** Use simple conditional logic in `layout.tsx` — check `pathname === '/'` and hide `<Navbar />`. Do NOT restructure into route groups. Less architectural disruption.

---

## Architecture Overview

```
CURRENTLY BROKEN                          TARGET STATE
━━━━━━━━━━━━━━━━━━━                      ━━━━━━━━━━━━
/                   ✅ Working            / (landing)        ✅
/topics             ❌ SSR crash          /topics             ✅ Static MDX index
/topics/[slug]      ❌ Dynamic import     /topics/[slug]      ✅ MDX article + sim
/community          ❌ Prisma crash       /community          ✅ Real SQLite DB forum
/community/[tid]    ❌ Prisma crash       /community/[tid]    ✅ Thread view (real DB)
/auth/signin        ❌ 404               /auth/signin        ✅ Sign-in page
/auth/signup        ❌ 404               /auth/signup        ✅ Sign-up page
```

---

## Phase 1: Fix Build-Breaking Errors (MUST DO FIRST)

> [!CAUTION]  
> Do NOT start any visual work until ALL routes compile without errors. Run `npx tsc --noEmit` after each fix.

### 1.1 — Fix `/topics/[slug]` Dynamic Import

**Bug:** `dynamic(() => import(\`@/content/topics/${slug}.mdx\`))` uses a runtime variable in the import path. Webpack cannot resolve this.

**Fix:** Replace with static import map pattern:

#### [MODIFY] [page.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Physova-main/app/topics/%5Bslug%5D/page.tsx)

Replace lines 41-44:
```diff
-  const Content = dynamic(() => import(`@/content/topics/${slug}.mdx`), {
-    loading: () => <div className="animate-pulse h-96 bg-white/5 rounded-2xl border border-white/5"></div>,
-  });
+  // Static import map — each MDX file must be explicitly listed
+  const contentMap: Record<string, React.ComponentType> = {
+    'double-slit': React.lazy(() => import('@/content/topics/double-slit.mdx')),
+    'entanglement': React.lazy(() => import('@/content/topics/entanglement.mdx')),
+    'superposition': React.lazy(() => import('@/content/topics/superposition.mdx')),
+  };
+  const Content = contentMap[slug];
+  if (!Content) notFound();
```

Also wrap the `<Content />` usage in a `<Suspense>` boundary.

### 1.2 — Fix Prisma Setup (ROOT CAUSE of `/community` + `/community/[threadId]` crashes)

**Bug:** `prisma.thread.findMany()` crashes because:
- (a) SQLite database has **no tables** (migrations/push never ran)
- (b) `lib/prisma.ts` uses `@prisma/adapter-libsql` + `@libsql/client` — unnecessary complexity for local SQLite

**Fix (3 steps):**

#### Step A: Simplify `lib/prisma.ts` — remove LibSQL adapter

#### [MODIFY] [prisma.ts](file:///c:/Users/Shubhadeep%20Roy/Downloads/Physova-main/lib/prisma.ts)

Replace the entire file:
```ts
import { PrismaClient } from './generated-prisma/client.js'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
```

#### Step B: Push schema to SQLite
```bash
npx prisma db push
npx prisma generate
```
This creates `dev.db` with all tables from `schema.prisma`.

#### Step C: Create seed script

#### [NEW] `prisma/seed.ts`

Seed 1 admin user + 5 forum threads + a few comments so the community page has real content:
```ts
import { PrismaClient } from '../lib/generated-prisma/client.js'
const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@Physova.dev' },
    update: {},
    create: {
      email: 'admin@Physova.dev',
      name: 'PhysovaOwner',
      role: 'OWNER',
    },
  })

  // Create test threads
  const threads = [
    'Can someone explain quantum tunneling intuitively?',
    'Suggestion: Add a Stern-Gerlach experiment simulation',
    'Great YouTube series on quantum computing basics',
    'How does the double-slit experiment differ with electrons vs photons?',
    'Difference between superposition and entanglement?',
  ]

  for (const title of threads) {
    await prisma.thread.create({
      data: { title, authorId: admin.id },
    })
  }

  console.log('Seeded database with admin user and 5 threads')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Run with: `npx tsx prisma/seed.ts`

> [!NOTE]
> After this, the existing `community/page.tsx` with `prisma.thread.findMany()` will work AS-IS. No mock data needed.

### 1.3 — Fix `/community/[threadId]` Page

#### [MODIFY] [page.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Physova-main/app/community/%5BthreadId%5D/page.tsx)

Once Prisma is working (1.2), update this page to query thread + comments from DB. If the threadId doesn't exist, call `notFound()`.

### 1.4 — Fix `CommentSection` Component

The `CommentSection` component (used in community sidebar) makes API calls to `/api/comments`. These API routes need to use the working Prisma client.

#### [MODIFY] [comment-section.tsx](file:///c:/Users/Shubhadeep%20Roy/Downloads/Physova-main/components/social/comment-section.tsx)

Review the component. If it fetches from `/api/comments`, make sure those API routes exist and work with the real DB. The `threadId="global-discussion"` needs a matching thread in the seed data — add one to the seed script.

### 1.5 — Create Auth Pages (Currently 404)

The navbar links to `/auth/signin` and `/auth/signup` but these pages don't exist.

#### [NEW] `app/auth/signin/page.tsx`
#### [NEW] `app/auth/signup/page.tsx`

Create styled sign-in/sign-up pages that match the dark theme. For Phase 1, these can be placeholder pages with a "Coming Soon" message or simple Google OAuth buttons (NextAuth handles the actual flow).

### 1.6 — Fix Landing Page Navbar Interference

The landing page has a `950vh` scroll container with `fixed` positioned content. But the root `layout.tsx` adds `<Navbar />` and `<main className="pt-[72px]">` to ALL pages including the landing page. This means:
- The navbar appears over the landing page (which has its own scroll-driven content)
- The `pt-[72px]` padding shifts things

**Fix:** Conditionally hide the navbar on the landing page, OR create a separate layout for the landing page.

The simplest approach: Create a `(marketing)` route group for the landing page with its own layout that doesn't include the navbar.

---

## Phase 2: Make Every Page Visually Stunning

> [!IMPORTANT]
> Inherit the design language from the old HTML version:
> - Dark background `#13171E`
> - Gold/amber accents for physics energy
> - Cool blue/violet for community
> - Glassmorphism cards with backdrop-blur
> - Neumorphic shadows
> - Stagger reveal animations on scroll

### 2.1 — `/topics` (Topics Index Page)

**Reference:** `(old version)/simulations.html` + `(old version)/courses.html`

The current `topics-list.tsx` already exists and looks decent. Fixes needed:
- The page just works once the MDX import is fixed (Phase 1)
- Add scroll-triggered stagger animations (already has Framer Motion variants)
- Add footer component (missing from all pages)
- Cards should have colored accent borders based on difficulty (like old sim cards)

**Superpowers to use:**
- `@designer` — review card design against old HTML, ensure glassmorphism
- `@coder` — implement difficulty-colored borders and footer

### 2.2 — `/topics/[slug]` (Article Page)

**Reference:** `(old version)/double-slit.html`, `entanglement.html`, `superposition.html`

The current `topics/[slug]/page.tsx` is well-designed with a sidebar lab module. Fixes:
- Fix the dynamic import (Phase 1.1)
- The `Lab` component only implements `double-slit`. Need to add `superposition` and `entanglement` simulation renderers in `lab-interface.tsx`
- Add the educational info panels from old HTML (equations, historical context, application cards)
- Ensure KaTeX equation rendering works (currently just plain text `d sin(θ) = nλ`)

**Superpowers to use:**
- `@coder` — port old p5.js simulations to Canvas-based React components
- `@designer` — equation rendering with KaTeX, info panel styling
- `@debugger` — test all 3 article pages load correctly

### 2.3 — `/community` (Forum Page)

**Reference:** `(old version)/forum.html`

The current `community-hub.tsx` is well-designed. Once Prisma is replaced with mock data (Phase 1.2):
- Add category filter cards (General, Help, Ideas, Resources) from old HTML
- Add "New Post" modal dialog  
- Add thread category tags (color-coded badges)
- Make the sidebar "Global Signal" section work with mock comments

**Superpowers to use:**
- `@designer` — category cards, post modal, color-coded tags
- `@coder` — modal with shadcn Dialog, category filtering logic

### 2.4 — `/community/[threadId]` (Thread View)

**Reference:** No old HTML equivalent — this is new

Design a thread detail view:
- Thread title + author + timestamp header
- Comment tree (threaded replies with indentation)
- Reply input at bottom
- Back navigation to `/community`

**Superpowers to use:**
- `@designer` — thread layout, comment tree, reply UX
- `@coder` — implement with mock comment data

### 2.5 — Auth Pages

**Reference:** No old HTML equivalent — new feature

#### `/auth/signin`
- Dark glassmorphism card centered on page
- Google OAuth button (styled)
- Email/password fields (disabled for Phase 1 with "Coming Soon" note)
- Link to signup

#### `/auth/signup`
- Similar design to signin
- Name + Email + Password fields
- Google OAuth button
- Link to signin

**Superpowers to use:**
- `@designer` — auth page layout, glassmorphism card
- `@coder` — NextAuth signIn flow integration
- `@security` — ensure proper CSRF, no password storage in Phase 1

---

## Phase 3: Complete the Simulations

### 3.1 — Port Superposition Simulation

**Reference:** `(old version)/superposition.html` + `(old version)/superposition.js`

The old version uses p5.js to render:
- A quantum spin particle with probability clouds
- Spin up (blue) / spin down (orange) states
- Measurement collapse animation
- Probability slider control

**Implementation:** Create `components/simulations/superposition-sim.tsx`:
- Use HTML Canvas (not p5.js — avoid the CDN dependency)
- Port the rendering logic from `superposition.js`
- Connect to the simulation store controls
- Register in `lab-interface.tsx` switch statement

### 3.2 — Port Entanglement Simulation

**Reference:** `(old version)/entanglement.html` + `(old version)/entanglement.js`

The old version uses p5.js to render:
- Two entangled particles with connecting visualization
- Distance slider
- Generate/Measure buttons
- Correlated collapse animation

**Implementation:** Create `components/simulations/entanglement-sim.tsx`:
- Same approach as superposition
- Port from `entanglement.js`
- Register in `lab-interface.tsx`

### 3.3 — Review Double-Slit Simulation

The double-slit sim already exists in `double-slit-sim.tsx` using R3F Canvas. Verify it:
- Loads without errors
- Controls work (wavelength, slit distance, observer toggle)
- Renders the interference pattern correctly

**Superpowers to use:**
- `@coder` — port p5.js logic to HTML Canvas components
- `@debugger` — test all 3 simulations in each topic page
- `@reviewer` — verify physics accuracy of animations

---

## Phase 4: Shared Components & Polish

### 4.1 — Footer Component

Create a shared `<Footer />` component used on all non-landing pages:
- Physova logo with gradient
- Copyright text
- Links: Home, Topics, Community, Discord
- Match old HTML footer design

#### [NEW] `components/footer.tsx`

### 4.2 — Mobile Navigation

The `mobile-nav.tsx` exists but verify:
- Sheet/drawer opens on mobile
- Links navigate correctly
- Closes after navigation

### 4.3 — Responsive Audit

Test all pages at these breakpoints:
- 320px (small mobile)
- 375px (iPhone SE)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop)

**Superpowers to use:**
- `@debugger` — systematic viewport testing
- `@designer` — responsive layout fixes

---

## Execution Order for Agents

> [!IMPORTANT]
> Follow this order EXACTLY. Each phase must compile (`npx tsc --noEmit`) before moving to the next.

### Step 1 — `@debugger` + `@coder`
Fix all Phase 1 items. Verify every route compiles and renders without crashes.
- Use `use-superpowers` for systematic error tracing
- Use `test-driven-development` — check each route after fixing

### Step 2 — `@designer` + `@coder`
Implement Phase 2 visual work. Start with `/topics` since it's closest to working.
- Use `brainstorming` for auth page design
- Use `subagent-driven-development` — designer creates mockup, coder implements

### Step 3 — `@coder`
Port simulations (Phase 3). This is independent of Phase 2.
- Use `systematic-debugging` to verify each sim renders correctly
- Run in parallel with Phase 2 if possible

### Step 4 — `@reviewer`
Final pass over all pages.
- Responsive audit
- Navigation consistency
- Performance check (compile times)

---

## Files to Create

| File | Purpose |
|---|---|
| `app/auth/signin/page.tsx` | Sign-in page |
| `app/auth/signup/page.tsx` | Sign-up page |
| `components/footer.tsx` | Shared footer |
| `components/simulations/superposition-sim.tsx` | Superposition Canvas sim |
| `components/simulations/entanglement-sim.tsx` | Entanglement Canvas sim |

## Files to Modify

| File | Change |
|---|---|
| `lib/prisma.ts` | Remove LibSQL adapter, use standard PrismaClient |
| `app/community/[threadId]/page.tsx` | Fix Prisma query + design thread view |
| `app/topics/[slug]/page.tsx` | Fix dynamic import → static import map |
| `components/social/comment-section.tsx` | Verify API routes work with real DB |
| `components/simulations/lab-interface.tsx` | Register superposition + entanglement sims |
| `app/layout.tsx` | Conditionally show navbar (hide on landing via pathname check) |

## Files to Create (NEW)

| File | Purpose |
|---|---|
| `prisma/seed.ts` | Seed admin user + 5 threads + global-discussion thread |

## Key Environment Dependencies

- **SQLite database** — created by `npx prisma db push`, seeded by `npx tsx prisma/seed.ts`
- **NextAuth** works with JWT strategy (Google OAuth needs real credentials later)
- **MDX** works via `@next/mdx` + `mdx-components.tsx` — no external deps

---

## Verification Plan

### Automated
```bash
# Must pass after each phase
npx tsc --noEmit
npm run build
```

### Manual Browser Testing (use ask_user function and ask user to test each of these out)
- Navigate to each route: `/`, `/topics`, `/topics/double-slit`, `/topics/superposition`, `/topics/entanglement`, `/community`, `/community/t1`, `/auth/signin`, `/auth/signup`
- Verify no console errors
- Verify responsive layout at 375px and 1440px
- Verify simulations animate correctly
- Verify navigation between pages works (navbar links, card links, back buttons)
