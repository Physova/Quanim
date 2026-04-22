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
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "RESUME"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button
        variant={waveMode ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setWaveMode(true)}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${waveMode ? 'bg-white text-black hover:bg-white/90' : 'hover:bg-white/10 text-white'}`}
      >
        <Waves className="h-3 w-3" />
        WAVE
      </Button>
      <Button
        variant={!waveMode ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setWaveMode(false)}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${!waveMode ? 'bg-white text-black hover:bg-white/90' : 'hover:bg-white/10 text-white'}`}
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
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${!isMeasured ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
      >
        <Ruler className="h-3 w-3" />
        {isMeasured ? "MEASURED" : "MEASURE STATE"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
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
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all bg-white text-black hover:bg-white/90`}
      >
        <Link className="h-3 w-3" />
        GENERATE PAIR
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleMeasureEntanglement()}
        disabled={!isEntangled || isMeasuredA}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${isEntangled && !isMeasuredA ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
      >
        <Share2 className="h-3 w-3" />
        MEASURE ALICE
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleMeasureEntanglement()}
        disabled={!isEntangled || isMeasuredB}
        className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${isEntangled && !isMeasuredB ? 'bg-white/80 text-black hover:bg-white/90' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
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
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Wavelength</label>
          <span className="text-[10px] font-mono text-white/60">{wavelength}nm</span>
        </div>
        <input 
          type="range" 
          min="380" 
          max="780" 
          step="1" 
          value={wavelength} 
          onChange={(e) => setWavelength(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
      </div>

      {/* Slit Distance Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Slit Gap</label>
          <span className="text-[10px] font-mono text-white/60">{(slitDistance / 10).toFixed(2)}µm</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="0.1" 
          value={slitDistance} 
          onChange={(e) => setSlitDistance(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
      </div>

      <Separator className="bg-white/10" />

      {/* Observer State */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Observation</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setObserverState("none")}
            className={`text-[9px] h-7 border-white/10 rounded-none transition-all ${observerState === 'none' ? 'bg-white/10 border-white/40 text-white' : 'text-white/30 hover:text-white'}`}
          >
            <EyeOff className="h-3 w-3 mr-1" /> NONE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setObserverState("both")}
            className={`text-[9px] h-7 border-white/10 rounded-none transition-all ${observerState === 'both' ? 'bg-white/10 border-white/40 text-white' : 'text-white/30 hover:text-white'}`}
          >
            <Eye className="h-3 w-3 mr-1" /> ACTIVE
          </Button>
        </div>
        <p className="text-[8px] text-white/30 italic leading-tight">
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
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Spin Up Prob.</label>
          <span className="text-[10px] font-mono text-white/60">{Math.round(probUp * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={probUp} 
          onChange={(e) => setProbUp(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
          disabled={isMeasured}
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">State Logic</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-none border border-white/10">
            <div className="h-2 w-2 rounded-none bg-white/60" />
            <span className="text-[9px] text-white/60 uppercase tracking-wide font-medium">Spin Up |↑⟩</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-none border border-white/10">
            <div className="h-2 w-2 rounded-none bg-white/40" />
            <span className="text-[9px] text-white/60 uppercase tracking-wide font-medium">Spin Down |↓⟩</span>
          </div>
        </div>
        <p className="text-[8px] text-white/30 italic leading-tight mt-3">
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
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Distance</label>
          <span className="text-[10px] font-mono text-white/60">{entanglementDistance} units</span>
        </div>
        <input 
          type="range" 
          min="100" 
          max="500" 
          step="10" 
          value={entanglementDistance} 
          onChange={(e) => setEntanglementDistance(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>Close</span>
          <span>Distant</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Entanglement Info</label>
        <div className="p-3 bg-white/[0.03] rounded-none border border-white/10 space-y-2">
          <p className="text-[9px] text-white/60 leading-relaxed">
            Particles are in a Bell State:
          </p>
          <div className="font-mono text-[10px] text-white/80 bg-white/[0.03] p-1.5 rounded-none text-center">
            |Ψ⟩ = 1/√2 (|↑↓⟩ - |↓↑⟩)
          </div>
          <p className="text-[8px] text-white/30 italic leading-tight pt-1">
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
      id={`lab-${type}`}
      simType={type}
      title={getTitle()}
      description={getDescription()}
      onReset={handleReset}
      controls={getControls()}
      sidebarControls={getSidebarControls()}
      is3D={true}
      className={className}
    >
      {renderSimulation()}
    </LabContainer>
  );
}
