"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import ForceAndLawsOfMotionSim from "./force-and-laws-of-motion-sim";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, MoveRight } from "lucide-react";

interface ForceLabProps {
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_FORCE = 20;
const DEFAULT_MASS = 5;
const DEFAULT_FRICTION = 0.2;

export function ForceAndLawsOfMotionLab({ title, description, className }: ForceLabProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [appliedForce, setAppliedForce] = React.useState(DEFAULT_FORCE);
  const [mass, setMass] = React.useState(DEFAULT_MASS);
  const [frictionCoeff, setFrictionCoeff] = React.useState(DEFAULT_FRICTION);
  const [simKey, setSimKey] = React.useState(0);

  const handleReset = () => {
    setAppliedForce(DEFAULT_FORCE);
    setMass(DEFAULT_MASS);
    setFrictionCoeff(DEFAULT_FRICTION);
    setIsPlaying(false);
    setSimKey(prev => prev + 1);
  };

  const resetBot = () => {
    setSimKey(prev => prev + 1);
  };

  const controls = (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "RESUME"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button 
        variant="ghost" 
        size="sm"
        onClick={resetBot}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
      >
        <MoveRight className="h-3 w-3" />
        RESET BOT
      </Button>
    </>
  );

  const sidebarControls = (
    <div className="space-y-6">
      {/* Force Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Applied Force
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {appliedForce} N
          </span>
        </div>
        <input 
          type="range" 
          min="-100" 
          max="100" 
          step="1"
          value={appliedForce}
          onChange={(e) => setAppliedForce(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>LEFT (-100N)</span>
          <span>RIGHT (100N)</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Mass Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Object Mass
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {mass} kg
          </span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="50" 
          step="1"
          value={mass}
          onChange={(e) => setMass(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>LIGHT (1kg)</span>
          <span>HEAVY (50kg)</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Friction Control */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Friction (μ)
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {frictionCoeff.toFixed(2)}
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={frictionCoeff}
          onChange={(e) => setFrictionCoeff(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>ICE (0)</span>
          <span>ROUGH (1)</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Info Panel */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
          Newton&apos;s 2nd Law
        </label>
        <div className="p-3 bg-white/[0.03] rounded-none border border-white/10 space-y-2">
          <p className="text-[9px] text-white/60 leading-relaxed uppercase">
            Force equals mass times acceleration.
          </p>
          <div className="font-mono text-[11px] text-white/90 bg-white/[0.05] p-2 rounded-none text-center border border-white/5">
            F = m × a
          </div>
          <p className="text-[8px] text-white/30 italic leading-tight pt-1 uppercase">
            Change force or mass to see how acceleration reacts. Friction opposes motion.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <LabContainer
      id="lab-force-laws"
      simType="force-laws"
      title={title || "Force & Laws of Motion"}
      description={description || "Newton&apos;s Second Law and Friction"}
      onReset={handleReset}
      controls={controls}
      sidebarControls={sidebarControls}
      is3D={true}
      className={className}
    >
      <ForceAndLawsOfMotionSim 
        key={simKey}
        appliedForce={appliedForce}
        mass={mass}
        frictionCoeff={frictionCoeff}
        isPlaying={isPlaying}
        onBoundaryHit={() => setIsPlaying(false)}
      />
    </LabContainer>
  );
}
