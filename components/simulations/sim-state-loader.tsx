"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSimulationStore } from "@/lib/stores/simulation-store";

/**
 * Client component that reads ?sim= query param on mount
 * and applies the serialized simulation state to the store.
 * Place this inside article pages.
 */
export function SimStateLoader() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const simParam = searchParams.get("sim");
    if (simParam) {
      useSimulationStore.getState().deserialize(simParam);
    }
  }, [searchParams]);

  return null; // Renders nothing — just a side-effect component
}
