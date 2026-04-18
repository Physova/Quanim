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
  
  togglePlay: () => void;
  setParticleCount: (count: number) => void;
  setWaveMode: (mode: boolean) => void;
  setIntensity: (intensity: number) => void;
  setWavelength: (wavelength: number) => void;
  setSlitDistance: (distance: number) => void;
  setObserverState: (state: "none" | "left" | "right" | "both") => void;
  triggerReset: () => void;
  clearReset: () => void;
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

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setParticleCount: (count) => set({ particleCount: count }),
  setWaveMode: (mode) => set({ waveMode: mode }),
  setIntensity: (intensity) => set({ intensity }),
  setWavelength: (wavelength) => set({ wavelength }),
  setSlitDistance: (distance) => set({ slitDistance: distance }),
  setObserverState: (state) => set({ observerState: state }),
  triggerReset: () => set({ reset: true }),
  clearReset: () => set({ reset: false }),
}));
