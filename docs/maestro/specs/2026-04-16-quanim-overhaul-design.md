# Quanim 2.0 — Design Specification
# 2026-04-16 — Physics Overhaul

---

## 1. Vision & Goals
Transform the existing Quanim HTML site into a professional, high-end physics education and community platform.
- **Vibe:** Tech/Physics-y (Dynamic).
- **Core Engine:** Next.js 14 (App Router) + Three.js (via React Three Fiber).
- **Primary Goal:** Immersive, in-situ articles with interactive simulations and integrated community social layer.

---

## 2. Tech Stack (The "Revolution" Approach)
| Layer | Choice | Purpose |
|---|---|---|
| **Framework** | Next.js 14 | SSR, SSG, API Routes, Streaming |
| **Styling** | Tailwind + shadcn/ui | Professional, consistent UI components |
| **3D Engine** | React Three Fiber (R3F) | Declarative Three.js for GPU-accelerated sims |
| **State** | Zustand | Global sync between simulations and UI controls |
| **Database** | PostgreSQL (Supabase) | User data, comments, and simulation snapshots |
| **ORM** | Prisma | Type-safe database queries |
| **Auth** | NextAuth.js | GitHub/Google/Email authentication |

---

## 3. Architecture & Data Flow
### /app Structure
- `/page.tsx` — Immersive landing page with Three.js particle hero.
- `/topics/[slug]/page.tsx` — MDX articles with embedded `<Lab />` components.
- `/community/page.tsx` — Public forum hub.
- `/api/` — Server Actions and Route Handlers for DB interaction.

### Simulation Model (`/components/simulations/`)
- **Engine:** Three.js custom shaders for wave-particle visuals.
- **Controls:** Docked sidebar/bottom-bar controls synced via Zustand.
- **Triggers:** Inline text links in MDX that update `SimulationState`.

### Data Models (Prisma)
- **`User`**: Account info, premium status, roles.
- **`Article`**: Metadata (slug, title, tags, publishedAt).
- **`Comment`**: Threaded discussion with optional `SimStateID` link.
- **`SimState`**: JSON blob of parameters to recreate a specific simulation view.

---

## 4. User Experience (UX) Standards
- **Responsive:** Mobile-first, canvas auto-scaling.
- **Visuals:** Dark mode default, glassmorphism (`backdrop-blur`), gold accents.
- **Performance:** Lazy-load Three.js bundles; stream article text immediately.
- **Social:** Inline annotations (threads started from specific sentences).

---

## 5. Build Order (Maestro Implementation)
1. **Scaffold:** Initialize Next.js 14, Tailwind, Prisma, and NextAuth.
2. **Design System:** Establish tokens (Gold, Navy, Glass) and shadcn/ui theme.
3. **Migrator:** Port existing physics content to MDX; design initial `<Topic />` layout.
4. **Three.js Core:** Implement R3F provider and the first "Revolution" simulation (Double Slit).
5. **Community Logic:** Build DB schemas and comment/forum endpoints.
6. **Review & Audit:** Security pass, performance profiling, and owner sign-off.
