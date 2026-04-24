export type SimulationType = "double-slit" | "entanglement" | "superposition";

export interface EquationSimConfig {
  type: SimulationType;
  label: string;
  description?: string;
  initialParams?: Record<string, unknown>;
}

/**
 * Maps common physics equations to their interactive simulations.
 * This allows the EquationBlock component to automatically offer
 * a "Simulate" button for recognized equations.
 */
export const EQUATION_SIM_MAP: Record<string, EquationSimConfig> = {
  // Double Slit / Wave Interference
  "d sin(θ) = nλ": {
    type: "double-slit",
    label: "Double-Slit Interference",
    description: "Visualize how slit separation and wavelength create interference patterns.",
    initialParams: {
      wavelength: 550,
      slitDistance: 2.5,
      waveMode: true
    }
  },
  "Δy = Lλ / d": {
    type: "double-slit",
    label: "Fringe Spacing",
    description: "Calculate the distance between interference fringes.",
    initialParams: {
      wavelength: 400,
      slitDistance: 4.0,
      waveMode: true
    }
  },
  
  // Superposition
  "|ψ⟩ = α|0⟩ + β|1⟩": {
    type: "superposition",
    label: "Quantum Superposition",
    description: "Observe a quantum bit existing in multiple states simultaneously.",
    initialParams: {
      probUp: 0.5,
      isMeasured: false
    }
  },
  "P(i) = |⟨i|ψ⟩|²": {
    type: "superposition",
    label: "Born Rule",
    description: "Calculate the probability of finding a particle in a specific state.",
    initialParams: {
      probUp: 0.8,
      isMeasured: true
    }
  },

  // Entanglement
  "|Ψ⟩ = 1/√2 (|↑↓⟩ - |↓↑⟩)": {
    type: "entanglement",
    label: "Bell State",
    description: "Explore the perfectly anti-correlated state of two entangled particles.",
    initialParams: {
      isEntangled: true,
      isMeasuredA: false,
      isMeasuredB: false
    }
  },
  "E(a, b) = -cos(a - b)": {
    type: "entanglement",
    label: "Quantum Correlation",
    description: "Observe how measurement angles affect entanglement correlations.",
    initialParams: {
      isEntangled: true,
      entanglementDistance: 400
    }
  }
};

/**
 * Helper to find a simulation config by equation string (exact or partial match)
 */
export function getSimForEquation(equation: string): EquationSimConfig | undefined {
  // Try exact match first
  if (EQUATION_SIM_MAP[equation]) return EQUATION_SIM_MAP[equation];
  
  // Try partial match (strip spaces, ignore case)
  const normalized = equation.replace(/\s+/g, "").toLowerCase();
  
  for (const [key, config] of Object.entries(EQUATION_SIM_MAP)) {
    if (key.replace(/\s+/g, "").toLowerCase() === normalized) {
      return config;
    }
  }
  
  return undefined;
}
