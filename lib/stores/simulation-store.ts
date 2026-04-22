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
  
  // Superposition
  probUp: number;
  isMeasured: boolean;
  measuredState: 0 | 1;
  setProbUp: (probUp: number) => void;
  setIsMeasured: (isMeasured: boolean) => void;
  setMeasuredState: (measuredState: 0 | 1) => void;

  // Entanglement
  isEntangled: boolean;
  isMeasuredA: boolean;
  isMeasuredB: boolean;
  measuredStateA: 0 | 1;
  measuredStateB: 0 | 1;
  entanglementDistance: number;
  setIsEntangled: (isEntangled: boolean) => void;
  setIsMeasuredA: (isMeasuredA: boolean) => void;
  setIsMeasuredB: (isMeasuredB: boolean) => void;
  setMeasuredStateA: (measuredStateA: 0 | 1) => void;
  setMeasuredStateB: (measuredStateB: 0 | 1) => void;
  setEntanglementDistance: (distance: number) => void;

  // Persistence
  getParamsObject: () => Record<string, any>;
  applyParamsObject: (params: Record<string, any>) => void;
}

const SIM_PARAMS = [
  'particleCount', 'waveMode', 'intensity', 'wavelength', 'slitDistance', 'observerState',
  'probUp', 'isMeasured', 'measuredState',
  'isEntangled', 'isMeasuredA', 'isMeasuredB', 'measuredStateA', 'measuredStateB', 'entanglementDistance'
] as const;

export const useSimulationStore = create<SimulationState>((set, get) => ({
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

  getParamsObject: () => {
    const state = get();
    const params: Record<string, any> = {};
    
    SIM_PARAMS.forEach(key => {
      const value = (state as any)[key];
      if (value !== undefined && typeof value !== 'function') {
        params[key] = value;
      }
    });
    return params;
  },

  applyParamsObject: (params: Record<string, any>) => {
    const updates: Partial<SimulationState> = {};
    
    SIM_PARAMS.forEach(key => {
      if (params[key] !== undefined) {
        (updates as any)[key] = params[key];
      }
    });
    
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },
}));
