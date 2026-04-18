"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import { DoubleSlitSim } from "./double-slit-sim";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { Button } from "@/components/ui/button";
import { Play, Pause, Zap, Waves, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface LabProps {
  type: "double-slit" | "entanglement" | "superposition";
  title?: string;
  description?: string;
  className?: string;
}

export function Lab({ type, title, description, className }: LabProps) {
  const { 
    isPlaying, togglePlay, 
    waveMode, setWaveMode, 
    wavelength, setWavelength,
    slitDistance, setSlitDistance,
    observerState, setObserverState,
    triggerReset, clearReset 
  } = useSimulationStore();

  const handleReset = () => {
    triggerReset();
    setTimeout(clearReset, 100);
  };

  const renderSimulation = () => {
    switch (type) {
      case "double-slit":
        return <DoubleSlitSim />;
      default:
        return null;
    }
  };

  const SimulationControls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-full hover:bg-white/10"
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "RESUME"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-slate-700" />
      <Button
        variant={waveMode ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setWaveMode(true)}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all ${waveMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'hover:bg-white/10'}`}
      >
        <Waves className="h-3 w-3" />
        WAVE
      </Button>
      <Button
        variant={!waveMode ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setWaveMode(false)}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all ${!waveMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'hover:bg-white/10'}`}
      >
        <Zap className="h-3 w-3" />
        PARTICLE
      </Button>
    </>
  );

  const SidebarControls = (
    <div className="space-y-6">
      {/* Wavelength Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wavelength</label>
          <span className="text-[10px] font-mono text-amber-500">{wavelength}nm</span>
        </div>
        <input 
          type="range" 
          min="380" 
          max="780" 
          step="1" 
          value={wavelength} 
          onChange={(e) => setWavelength(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Slit Distance Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slit Gap</label>
          <span className="text-[10px] font-mono text-amber-500">{(slitDistance / 10).toFixed(2)}µm</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="0.1" 
          value={slitDistance} 
          onChange={(e) => setSlitDistance(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      <Separator className="bg-slate-800" />

      {/* Observer State */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observation</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setObserverState("none")}
            className={`text-[9px] h-7 border-slate-800 transition-all ${observerState === 'none' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <EyeOff className="h-3 w-3 mr-1" /> NONE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setObserverState("both")}
            className={`text-[9px] h-7 border-slate-800 transition-all ${observerState === 'both' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Eye className="h-3 w-3 mr-1" /> ACTIVE
          </Button>
        </div>
        <p className="text-[8px] text-slate-500 italic leading-tight">
          Observing which slit the particle passes through collapses the wave function.
        </p>
      </div>
    </div>
  );

  return (
    <LabContainer
      title={title || `${type.charAt(0).toUpperCase() + type.slice(1)} Simulation`}
      description={description || "Real-time quantum interference engine"}
      onReset={handleReset}
      controls={SimulationControls}
      sidebarControls={SidebarControls}
      className={className}
    >
      {renderSimulation()}
    </LabContainer>
  );
}
