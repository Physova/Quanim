# Shareable Simulation URLs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to share the exact state of a physics simulation via a URL and ensure the state persists on page refresh.

**Architecture:** Use URL search parameters to serialize the simulation state. Add a Share button to the `LabContainer` to copy the shareable URL. Use a React effect in `LabContainer` to initialize the store from URL parameters on mount.

**Tech Stack:** Next.js (App Router), Zustand, Lucide React, Shadcn UI (Button).

---

### Task 1: Update Simulation Store with Serialization Logic

**Files:**
- Modify: `lib/stores/simulation-store.ts`

- [ ] **Step 1: Define serialization and deserialization helpers**

Add these helpers to `lib/stores/simulation-store.ts` (or inside the store definition).

```typescript
const SIM_PARAMS = [
  'particleCount', 'waveMode', 'intensity', 'wavelength', 'slitDistance', 'observerState',
  'probUp', 'isMeasured', 'measuredState',
  'isEntangled', 'isMeasuredA', 'isMeasuredB', 'measuredStateA', 'measuredStateB', 'entanglementDistance'
] as const;

type SimParam = typeof SIM_PARAMS[number];
```

- [ ] **Step 2: Add `getSerializedState` and `applySerializedState` to the store**

```typescript
  getSerializedState: () => {
    const state = get();
    const params = new URLSearchParams();
    SIM_PARAMS.forEach(key => {
      const value = state[key as keyof SimulationState];
      if (value !== undefined && typeof value !== 'function') {
        params.set(key, String(value));
      }
    });
    return params.toString();
  },
  applySerializedState: (params: URLSearchParams) => {
    const updates: any = {};
    params.forEach((value, key) => {
      if (SIM_PARAMS.includes(key as any)) {
        if (value === 'true') updates[key] = true;
        else if (value === 'false') updates[key] = false;
        else if (!isNaN(Number(value))) updates[key] = Number(value);
        else updates[key] = value;
      }
    });
    set(updates);
  },
```

### Task 2: Implement Share Button in LabContainer

**Files:**
- Modify: `components/simulations/lab-container.tsx`

- [ ] **Step 1: Import necessary icons and store**

```typescript
import { Share2, Check } from "lucide-react";
import { useSimulationStore } from "@/lib/stores/simulation-store";
```

- [ ] **Step 2: Add Share button to the header**

Add a `Share` button next to the `Reset`, `Split View`, and `Fullscreen` buttons.
Include a state for "Copied" feedback.

```typescript
  const [isCopied, setIsCopied] = React.useState(false);
  const getSerializedState = useSimulationStore(state => state.getSerializedState);

  const handleShare = () => {
    const serialized = getSerializedState();
    const url = new URL(window.location.href);
    url.search = serialized;
    navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
```

### Task 3: Initialize Store from URL on Mount

**Files:**
- Modify: `components/simulations/lab-container.tsx`

- [ ] **Step 1: Add effect to read URL parameters on mount**

```typescript
  const applySerializedState = useSimulationStore(state => state.applySerializedState);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.size > 0) {
      applySerializedState(params);
    }
  }, [applySerializedState]);
```

### Task 4: Validation and Testing

- [ ] **Step 1: Verify URL serialization**
Open a simulation, change some parameters (e.g., wavelength), click Share, and check the clipboard.

- [ ] **Step 2: Verify persistence on refresh**
Refresh the page with parameters in the URL and ensure the simulation reflects the state.

- [ ] **Step 3: Verify "Measured" state sharing**
For superposition/entanglement, measure the state, share the URL, and open it in a new tab. It should show the measured result.
