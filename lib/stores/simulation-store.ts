import { create } from "zustand";

interface SimulationState {
  isPlaying: boolean;
  particleCount: number;
  waveMode: boolean;
  intensity: number;
  wavelength: number;
  slitDistance: number;
  observerState: "none" | "left" | "right" | "both";
  reset: boolean;
  scrollProgress: number;
  
  // Superposition
  probUp: number;
  isMeasured: boolean;
  measuredState: 0 | 1;

  // Entanglement
  isEntangled: boolean;
  isMeasuredA: boolean;
  isMeasuredB: boolean;
  measuredStateA: 0 | 1;
  measuredStateB: 0 | 1;
  entanglementDistance: number;
  
  togglePlay: () => void;
  setParticleCount: (count: number) => void;
  setWaveMode: (mode: boolean) => void;
  setIntensity: (intensity: number) => void;
  setWavelength: (wavelength: number) => void;
  setSlitDistance: (distance: number) => void;
  setObserverState: (state: "none" | "left" | "right" | "both") => void;
  triggerReset: () => void;
  clearReset: () => void;
  setScrollProgress: (progress: number) => void;
  
  // Superposition setters
  setProbUp: (prob: number) => void;
  setIsMeasured: (measured: boolean) => void;
  setMeasuredState: (state: 0 | 1) => void;

  // Entanglement setters
  setIsEntangled: (entangled: boolean) => void;
  setIsMeasuredA: (measured: boolean) => void;
  setIsMeasuredB: (measured: boolean) => void;
  setMeasuredStateA: (state: 0 | 1) => void;
  setMeasuredStateB: (state: 0 | 1) => void;
  setEntanglementDistance: (distance: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isPlaying: true,
  particleCount: 1000,
  waveMode: true,
  intensity: 1.0,
  wavelength: 550, // nm (Greenish)
  slitDistance: 2.0, // arbitrary units
  observerState: "none",
  reset: false,
  scrollProgress: 0,
  
  // Superposition defaults
  probUp: 0.5,
  isMeasured: false,
  measuredState: 0,

  // Entanglement defaults
  isEntangled: false,
  isMeasuredA: false,
  isMeasuredB: false,
  measuredStateA: 0,
  measuredStateB: 0,
  entanglementDistance: 300,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setParticleCount: (count) => set({ particleCount: count }),
  setWaveMode: (mode) => set({ waveMode: mode }),
  setIntensity: (intensity) => set({ intensity }),
  setWavelength: (wavelength) => set({ wavelength }),
  setSlitDistance: (distance) => set({ slitDistance: distance }),
  setObserverState: (state) => set({ observerState: state }),
  triggerReset: () => set({ reset: true }),
  clearReset: () => set({ reset: false }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  
  // Superposition setters
  setProbUp: (probUp) => set({ probUp }),
  setIsMeasured: (isMeasured) => set({ isMeasured }),
  setMeasuredState: (measuredState) => set({ measuredState }),

  // Entanglement setters
  setIsEntangled: (isEntangled) => set({ isEntangled }),
  setIsMeasuredA: (isMeasuredA) => set({ isMeasuredA }),
  setIsMeasuredB: (isMeasuredB) => set({ isMeasuredB }),
  setMeasuredStateA: (measuredStateA) => set({ measuredStateA }),
  setMeasuredStateB: (measuredStateB) => set({ measuredStateB }),
  setEntanglementDistance: (entanglementDistance) => set({ entanglementDistance }),
}));
