# CODEBASE SUMMARY

## 1. Project Overview
- Physova is a physics education and community platform featuring rich interactive simulations, MDX-based articles, and discussion forums.
- Tech stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma (SQLite), NextAuth.js, Framer Motion, Three.js (@react-three/fiber/drei), Zustand.
- Entry points: `app/page.tsx` (Home), `npm run dev` (Local development), `prisma/schema.prisma` (Database source).

## 2. Directory Structure (annotated)
C:\Users\Shubhadeep Roy\Downloads\Quanim-main\
├── app/ # Next.js App Router pages and API routes
│   ├── api/ # Backend endpoints (auth, comments, reactions)
│   ├── community/ # Forum and discussion threads
│   ├── topics/ # Dynamic article routes based on MDX content
│   └── page.tsx # Landing page with complex 3D hero
├── components/ # Reusable React components
│   ├── simulations/ # Interactive physics lab components (3D/Canvas)
│   ├── social/ # Community features (comments, threads)
│   ├── ui/ # Shadcn/UI base components
│   └── visuals/ # Complex visual sections (Bento, Hero)
├── content/ # MDX source files for articles
│   └── topics/ # Physics topic content (e.g., double-slit)
├── lib/ # Shared utilities, DB client, and state stores
│   ├── stores/ # Zustand state management for simulations
│   ├── prisma.ts # Database client singleton
│   └── mdx.ts # MDX processing logic
├── prisma/ # Database schema and seed scripts
│   └── schema.prisma # Core data models (User, Article, Thread)
├── public/ # Static assets (SVGs, icons)
└── types/ # Global TypeScript type definitions

## 3. Core Modules & Their Responsibilities
- `app/page.tsx`: Main landing page; integrates `PhysovaHero` for high-fidelity 3D narrative.
- `components/visuals/physova-hero.tsx`: Massive 3D interactive component using R3F; handles scroll-based storytelling.
- `components/simulations/lab-container.tsx`: Framework for hosting interactive physics experiments.
- `lib/prisma.ts`: Exports `prisma` client for server-side database operations.
- `lib/mdx.ts`: Utility to parse `.mdx` files from `content/` and inject frontmatter.
- `lib/stores/simulation-store.ts`: Zustand store managing global simulation parameters and UI state.
- `prisma/schema.prisma`: Defines the relational model for users, articles, comments, threads, and reactions.

## 4. Data Flow & Architecture
- **Input**: NextAuth handle user sessions; App Router Server Components fetch initial data via Prisma; Client Components send updates via API routes (`/api/*`).
- **Processing**: MDX files are read from disk and rendered with custom components (`mdx-components.tsx`); Zustand handles ephemeral simulation state.
- **Output**: SSR/ISR generated pages; client-side JSON responses from API routes; persistent writes to SQLite (`dev.db`).
- **State**: Mix of Server Components (SSR), local React state (UI), and Zustand (global simulation parameters).

## 5. Key Abstractions & Patterns
- **MDX Integration**: Articles are filesystem-based, allowing the owner to write physics content in Markdown with embedded React simulations.
- **Provider Pattern**: `components/providers.tsx` wraps the app in Auth and Theme providers.
- **Simulations Framework**: Reusable `LabContainer` and `LabInterface` for consistent experiment UI.
- **Shadcn/UI**: Standardized design system for buttons, cards, and inputs.

## 6. External Dependencies & Integrations
- **NextAuth.js**: Authentication with Prisma adapter.
- **Three.js / R3F**: Used for complex 3D visualizations and interactive physics labs.
- **Prisma**: ORM for SQLite; likely migrates to PostgreSQL in production.
- **Env Vars**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`.

## 7. Known Complexity Hotspots
- `components/visuals/physova-hero.tsx`: ~800+ lines; manages heavy 3D rendering and scroll-narrative logic.
- `components/simulations/lab-interface.tsx`: Complex logic for coordinating multiple physics parameters.
- `app/api/comments/route.ts`: Handles nested comments and polymorphic relations (articles vs threads).

## 8. What Is MISSING or INCOMPLETE
- `SimState` model in Prisma seems underutilized in the current UI.
- Search endpoint (`/api/search`) is mentioned in `GEMINI.md` but not yet fully implemented as a standalone route.
- Advanced community moderation features (stubs present in `GEMINI.md`).
