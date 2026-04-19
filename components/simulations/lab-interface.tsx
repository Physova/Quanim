"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import { DoubleSlitSim } from "./double-slit-sim";
import SuperpositionSim from "./superposition-sim";
import EntanglementSim from "./entanglement-sim";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { Button } from "@/components/ui/button";
import { Play, Pause, Zap, Waves, Eye, EyeOff, Ruler, RotateCcw, Link, Share2 } from "lucide-react";
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
    probUp, setProbUp,
    isMeasured, setIsMeasured,
    setMeasuredState,
    isEntangled, setIsEntangled,
    isMeasuredA, setIsMeasuredA,
    isMeasuredB, setIsMeasuredB,
    setMeasuredStateA,
    setMeasuredStateB,
    entanglementDistance, setEntanglementDistance,
    triggerReset, clearReset 
  } = useSimulationStore();

  const handleReset = () => {
    triggerReset();
    if (type === "superposition") {
      setIsMeasured(false);
    } else if (type === "entanglement") {
      setIsEntangled(false);
      setIsMeasuredA(false);
      setIsMeasuredB(false);
    }
    setTimeout(clearReset, 100);
  };

  const handleMeasure = () => {
    if (type === "superposition" && !isMeasured) {
      const state = Math.random() < probUp ? 0 : 1;
      setMeasuredState(state);
      setIsMeasured(true);
    }
  };

  const handleGeneratePair = () => {
    setIsEntangled(true);
    setIsMeasuredA(false);
    setIsMeasuredB(false);
  };

  const handleMeasureEntanglement = () => {
    if (isEntangled && (!isMeasuredA || !isMeasuredB)) {
      // First measurement determines both
      const stateA = Math.random() < 0.5 ? 0 : 1;
      const stateB = (1 - stateA) as 0 | 1;
      
      setMeasuredStateA(stateA);
      setMeasuredStateB(stateB);
      setIsMeasuredA(true);
      setIsMeasuredB(true);
    }
  };

  const renderSimulation = () => {
    switch (type) {
      case "double-slit":
        return <DoubleSlitSim />;
      case "superposition":
        return <SuperpositionSim />;
      case "entanglement":
        return <EntanglementSim />;
      default:
        return null;
    }
  };

  const DoubleSlitSimulationControls = (
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

  const SuperpositionSimulationControls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMeasure}
        disabled={isMeasured}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all ${!isMeasured ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        <Ruler className="h-3 w-3" />
        {isMeasured ? "MEASURED" : "MEASURE STATE"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-slate-700" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-full hover:bg-white/10"
      >
        <RotateCcw className="h-3 w-3" />
        RESET
      </Button>
    </>
  );

  const EntanglementSimulationControls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGeneratePair}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all bg-amber-500 text-slate-950 hover:bg-amber-400`}
      >
        <Link className="h-3 w-3" />
        GENERATE PAIR
      </Button>
      <Separator orientation="vertical" className="h-4 bg-slate-700" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleMeasureEntanglement()}
        disabled={!isEntangled || isMeasuredA}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all ${isEntangled && !isMeasuredA ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        <Share2 className="h-3 w-3" />
        MEASURE ALICE
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleMeasureEntanglement()}
        disabled={!isEntangled || isMeasuredB}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-full transition-all ${isEntangled && !isMeasuredB ? 'bg-pink-500 text-white hover:bg-pink-400' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
      >
        <Share2 className="h-3 w-3" />
        MEASURE BOB
      </Button>
    </>
  );

  const DoubleSlitSidebarControls = (
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

  const SuperpositionSidebarControls = (
    <div className="space-y-6">
      {/* Probability Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spin Up Prob.</label>
          <span className="text-[10px] font-mono text-amber-500">{Math.round(probUp * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={probUp} 
          onChange={(e) => setProbUp(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          disabled={isMeasured}
        />
        <div className="flex justify-between text-[8px] text-slate-500 px-1 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">State Logic</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] text-slate-300 uppercase tracking-wide font-medium">Spin Up |↑⟩</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
            <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            <span className="text-[9px] text-slate-300 uppercase tracking-wide font-medium">Spin Down |↓⟩</span>
          </div>
        </div>
        <p className="text-[8px] text-slate-500 italic leading-tight mt-3">
          The particle exists in both states until measurement forces it to &quot;choose&quot; based on probability amplitudes.
        </p>
      </div>
    </div>
  );

  const EntanglementSidebarControls = (
    <div className="space-y-6">
      {/* Distance Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distance</label>
          <span className="text-[10px] font-mono text-amber-500">{entanglementDistance} units</span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="500" 
          step="10" 
          value={entanglementDistance} 
          onChange={(e) => setEntanglementDistance(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[8px] text-slate-500 px-1 font-mono">
          <span>Close</span>
          <span>Distant</span>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Entanglement Info</label>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50 space-y-2">
          <p className="text-[9px] text-slate-300 leading-relaxed">
            Particles are in a Bell State:
          </p>
          <div className="font-mono text-[10px] text-amber-500 bg-black/30 p-1.5 rounded text-center">
            |Ψ⟩ = 1/√2 (|↑↓⟩ - |↓↑⟩)
          </div>
          <p className="text-[8px] text-slate-500 italic leading-tight pt-1">
            Measuring one instantly determines the other, preserving anti-correlation across any distance.
          </p>
        </div>
      </div>
    </div>
  );

  const getControls = () => {
    switch (type) {
      case "double-slit": return DoubleSlitSimulationControls;
      case "superposition": return SuperpositionSimulationControls;
      case "entanglement": return EntanglementSimulationControls;
      default: return null;
    }
  };

  const getSidebarControls = () => {
    switch (type) {
      case "double-slit": return DoubleSlitSidebarControls;
      case "superposition": return SuperpositionSidebarControls;
      case "entanglement": return EntanglementSidebarControls;
      default: return null;
    }
  };

  const getTitle = () => title || `${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} Simulation`;
  const getDescription = () => description || (
    type === 'double-slit' ? "Real-time quantum interference engine" : 
    type === 'superposition' ? "Wavefunction superposition & collapse" :
    "Correlated particles & spooky action"
  );

  return (
    <LabContainer
      title={getTitle()}
      description={getDescription()}
      onReset={handleReset}
      controls={getControls()}
      sidebarControls={getSidebarControls()}
      is3D={type === 'double-slit'}
      className={className}
    >
      {renderSimulation()}
    </LabContainer>
  );
}
