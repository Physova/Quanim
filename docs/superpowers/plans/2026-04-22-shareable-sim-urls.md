# Shareable Simulation URLs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement URL-based state serialization for simulations and automatic fullscreen mode.

**Architecture:** Update the zustand store to support JSON/Base64 serialization. Update the `LabContainer` component to sync URL state with the store and handle the `fullscreen` parameter.

**Tech Stack:** Next.js (App Router), Zustand, Base64 encoding.

---

### Task 1: Update Simulation Store Serialization

**Files:**
- Modify: `lib/stores/simulation-store.ts`

- [ ] **Step 1: Add serialize and deserialize functions to the store**

```typescript
// Inside useSimulationStore
  serialize: () => {
    const params = get().getParamsObject();
    return btoa(JSON.stringify(params));
  },

  deserialize: (base64: string) => {
    try {
      const json = atob(base64);
      const params = JSON.parse(json);
      get().applyParamsObject(params);
    } catch (e) {
      console.error("Failed to deserialize simulation state", e);
    }
  },
```

- [ ] **Step 2: Update the interface**

```typescript
interface SimulationState {
  // ... existing
  serialize: () => string;
  deserialize: (base64: string) => void;
}
```

### Task 2: Implement URL Sync in LabContainer

**Files:**
- Modify: `components/simulations/lab-container.tsx`

- [ ] **Step 1: Add logic to read `params` and `fullscreen` from URL on mount**

```typescript
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedState = params.get("params");
    const shouldFullscreen = params.get("fullscreen") === "true";
    
    if (encodedState) {
      try {
        const json = atob(encodedState);
        const state = JSON.parse(json);
        applyParamsObject(state);
      } catch (e) {
        console.error("Failed to hydrate state from URL:", e);
      }
    }

    if (shouldFullscreen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        containerRef.current?.requestFullscreen().catch(console.error);
      }, 500);
    }
  }, [applyParamsObject]);
```

- [ ] **Step 2: Add logic to update URL whenever store changes**

Use a debounced effect to update the URL when `getParamsObject()` changes.

```typescript
  // Update URL when params change
  React.useEffect(() => {
    const params = getParamsObject();
    const encoded = btoa(JSON.stringify(params));
    
    const url = new URL(window.location.href);
    if (url.searchParams.get("params") !== encoded) {
      url.searchParams.set("params", encoded);
      window.history.replaceState(null, "", url.toString());
    }
  }, [getParamsObject]);
```

Wait, `getParamsObject` is a function, it doesn't trigger effects. I need to subscribe to the store.

```typescript
  React.useEffect(() => {
    const unsubscribe = useSimulationStore.subscribe((state) => {
        const params = state.getParamsObject();
        const encoded = btoa(JSON.stringify(params));
        const url = new URL(window.location.href);
        if (url.searchParams.get("params") !== encoded) {
          url.searchParams.set("params", encoded);
          window.history.replaceState(null, "", url.toString());
        }
    });
    return unsubscribe;
  }, []);
```

Wait, `subscribe` only fires when the state object changes. Since `SIM_PARAMS` are part of the state, it should work.

### Task 3: Verification

- [ ] **Step 1: Test URL serialization**
  - Change some simulation parameters.
  - Verify that the URL `?params=...` updates.
- [ ] **Step 2: Test URL deserialization**
  - Copy the URL with `params`.
  - Refresh the page or open in a new tab.
  - Verify that the simulation state is restored.
- [ ] **Step 3: Test Fullscreen on Open**
  - Append `&fullscreen=true` to the URL.
  - Open the URL.
  - Verify that the simulation opens in fullscreen.
- [ ] **Step 4: Verify manual fullscreen still works**
  - Enter and exit fullscreen manually.
  - Verify it works as expected.
