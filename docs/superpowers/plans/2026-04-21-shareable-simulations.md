# Implement Shareable Simulation URLs (Persistence) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to share the exact state of a physics simulation via a URL parameter.

**Architecture:** Use a server-side `SimState` model in PostgreSQL to store serialized JSON parameters, linked by a unique ID in the URL (`?state=ID`). Hydrate the Zustand store on component mount if the ID is present.

**Tech Stack:** Next.js (App Router), Prisma, PostgreSQL (Supabase), Zustand, Lucide React.

---

### Task 1: Complete `SimulationState` Interface and Store

**Files:**
- Modify: `lib/stores/simulation-store.ts`

- [ ] **Step 1: Update the interface to include all setter functions**
Ensure all functions implemented in the store are declared in the interface for type safety.

- [ ] **Step 2: Ensure `SIM_PARAMS` is exhaustive**
Verify all relevant parameters for double-slit, superposition, and entanglement are included.

- [ ] **Step 3: Commit**
`git add lib/stores/simulation-store.ts && git commit -m "feat(store): complete simulation store interface and parameters"`

### Task 2: Refine `LabContainer` for Robust Hydration

**Files:**
- Modify: `components/simulations/lab-container.tsx`

- [ ] **Step 1: Update hydration logic to verify `simType`**
Prevent cross-simulation state hydration by checking if the fetched state matches the container's `simType`.

- [ ] **Step 2: Improve Share button UX**
Ensure the "Share" button works correctly and provides visual feedback.

- [ ] **Step 3: Commit**
`git add components/simulations/lab-container.tsx && git commit -m "feat(sim): refine lab container hydration and sharing logic"`

### Task 3: Verify API Route and Database

**Files:**
- Create/Modify: `app/api/sim-state/route.ts` (Already exists, but verify)

- [ ] **Step 1: Verify the API route handles GET and POST correctly**
Ensure it uses Prisma to interact with `SimState` model.

- [ ] **Step 2: Run Prisma generate**
Ensure the client is up to date with the schema.

### Task 4: Validation

- [ ] **Step 1: Run build**
`npm run build`

- [ ] **Step 2: Final Commit**
`git commit -m "chore: final validation for shareable simulations"`
