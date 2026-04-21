# Physova Overhaul — Mega Implementation Plan
# 2026-04-16 — Multi-Agent Parallel Execution

---

## 1. Objective
Complete the Physova 2.0 migration: Port content, build simulation engine, and wire up social logic.

## 2. Key Files & Context
- `app/topics/`: MDX content destination.
- `components/simulations/`: Three.js/R3F core.
- `prisma/schema.prisma`: DB source of truth.
- `lib/auth.ts`: NextAuth config.

## 3. Phased Implementation Plan

### Phase 1: Preparation (Cleanup & Scaffold) — [Architect]
- Move legacy files to `(old version)`.
- Verify `next.config.js` and `tsconfig.json` for MDX support.
- Status: COMPLETED.

### Phase 2: Content Migration (Parallel) — [Coder, Designer]
- **Coder (A)**: Convert `double-slit.html`, `entanglement.html`, `superposition.html` to MDX files in `/content/topics/`.
- **Designer (A)**: Create typography and spacing tokens for articles.
- **Coder (B)**: Implement `/app/topics/[slug]` dynamic route with MDX support.
- Status: COMPLETED.

### Phase 3: Simulation Core (Parallel) — [Coder, Designer]
- **Designer (B)**: Visual design for simulation controls (sidebar, glassmorphism).
- **Coder (C)**: Implement R3F `<Lab />` container and the first Three.js shader for wave interference.
- Status: PENDING.

### Phase 4: Logic & Social (Parallel) — [Data Engineer, Coder]
- **Data Engineer**: Seed DB with mock users and articles.
- **Coder (D)**: Implement API routes for comments and upvotes (`/api/comments`, `/api/reactions`).
- **Coder (E)**: Build the `/community` forum hub layout.
- Status: PENDING.

### Phase 5: Audit & Completion — [Security, Reviewer]
- **Security**: Audit auth flows and input sanitization.
- **Reviewer**: Sign-off on UI performance and visual consistency.
- Status: PENDING.

## 4. Verification & Testing
- Check MDX rendering.
- Test Three.js canvas performance (LCP).
- Verify DB persistence for comments.
- Next.js build success.
