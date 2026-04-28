export type SimulationType = "double-slit" | "entanglement" | "superposition" | "motion" | "force-and-laws-of-motion";

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
  // Motion / Kinematics
  "v = u + at": {
    type: "motion",
    label: "Velocity-Time Relation",
    description: "Explore how velocity changes over time with constant acceleration.",
    initialParams: {
      initialVelocity: 0,
      acceleration: 2
    }
  },
  "s = ut + \\frac{1}{2}at^2": {
    type: "motion",
    label: "Position-Time Relation",
    description: "Visualize displacement as a function of time and acceleration.",
    initialParams: {
      initialVelocity: 5,
      acceleration: -1
    }
  },
  "v^2 = u^2 + 2as": {
    type: "motion",
    label: "Velocity-Displacement Relation",
    description: "See the relationship between velocity, acceleration, and distance.",
    initialParams: {
      initialVelocity: 10,
      acceleration: -2
    }
  },
  "a = \\frac{v - u}{t}": {
    type: "motion",
    label: "Acceleration Definition",
    description: "Observe the rate of change of velocity.",
    initialParams: {
      initialVelocity: 0,
      acceleration: 5
    }
  },

  // Double Slit / Wave Interference
  "d \\sin(\\theta) = n\\lambda": {
    type: "double-slit",
    label: "Double-Slit Interference",
    description: "Visualize how slit separation and wavelength create interference patterns.",
    initialParams: {
      wavelength: 550,
      slitDistance: 2.5,
      waveMode: true
    }
  },
  "\\Delta y = \\frac{L\\lambda}{d}": {
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
  "|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle": {
    type: "superposition",
    label: "Quantum Superposition",
    description: "Observe a quantum bit existing in multiple states simultaneously.",
    initialParams: {
      probUp: 0.5,
      isMeasured: false
    }
  },
  "P(i) = |\\langle i|\\psi\\rangle|^2": {
    type: "superposition",
    label: "Born Rule",
    description: "Calculate the probability of finding a particle in a specific state.",
    initialParams: {
      probUp: 0.8,
      isMeasured: true
    }
  },

  // Entanglement
  "|\\Psi\\rangle = \\frac{1}{\\sqrt{2}} (|\\uparrow\\downarrow\\rangle - |\\downarrow\\uparrow\\rangle)": {
    type: "entanglement",
    label: "Bell State",
    description: "Explore the perfectly anti-correlated state of two entangled particles.",
    initialParams: {
      isEntangled: true,
      isMeasuredA: false,
      isMeasuredB: false
    }
  },
  "E(a, b) = -\\cos(a - b)": {
    type: "entanglement",
    label: "Quantum Correlation",
    description: "Observe how measurement angles affect entanglement correlations.",
    initialParams: {
      isEntangled: true,
      entanglementDistance: 400
    }
  },

  // Force and Laws of Motion
  "F = ma": {
    type: "force-and-laws-of-motion",
    label: "Newton's Second Law",
    description: "Explore the relationship between force, mass, and acceleration.",
    initialParams: {
      appliedForce: 50,
      objectMass: 10
    }
  },
  "p = mv": {
    type: "force-and-laws-of-motion",
    label: "Momentum",
    description: "See how mass and velocity contribute to an object's momentum.",
    initialParams: {
      objectMass: 5,
      velocity: 10
    }
  },
  "F = \\frac{mv - mu}{t}": {
    type: "force-and-laws-of-motion",
    label: "Rate of Change of Momentum",
    description: "Calculate force as the rate at which momentum changes over time.",
    initialParams: {
      appliedForce: 100,
      objectMass: 10,
      initialVelocity: 0,
      finalVelocity: 20,
      time: 2
    }
  },
  "F = \\frac{m(v - u)}{t}": {
    type: "force-and-laws-of-motion",
    label: "Newton's Second Law (Variation)",
    description: "Calculate force using the change in velocity over time.",
    initialParams: {
      appliedForce: 100,
      objectMass: 10,
      initialVelocity: 0,
      finalVelocity: 20,
      time: 2
    }
  },
  "f = \\mu N": {
    type: "force-and-laws-of-motion",
    label: "Friction Force",
    description: "Experiment with different surfaces and normal forces to see friction in action.",
    initialParams: {
      coefficient: 0.3,
      normalForce: 100
    }
  },
  "m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2": {
    type: "force-and-laws-of-motion",
    label: "Conservation of Momentum",
    description: "Observe how total momentum is conserved during collisions.",
    initialParams: {
      mass1: 2,
      velocity1: 5,
      mass2: 3,
      velocity2: 0
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
