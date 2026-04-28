"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import MotionSim from "./motion-sim";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw, Info } from "lucide-react";

interface MotionLabProps {
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_U = 2; // m/s
const DEFAULT_A = 1; // m/s^2

export function MotionLab({ title, description, className }: MotionLabProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [u, setU] = React.useState(DEFAULT_U);
  const [a, setA] = React.useState(DEFAULT_A);
  const [resetKey, setResetKey] = React.useState(0);

  const handleReset = () => {
    setIsPlaying(false);
    setU(DEFAULT_U);
    setA(DEFAULT_A);
    setResetKey((prev) => prev + 1);
  };

  const controls = (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "START"}
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
    </div>
  );

  const sidebarControls = (
    <div className="space-y-6">
      {/* Initial Velocity Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Initial Velocity (u)
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {u} m/s
          </span>
        </div>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.5"
          value={u}
          onChange={(e) => setU(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>-10</span>
          <span>10</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Acceleration Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Acceleration (a)
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {a} m/s²
          </span>
        </div>
        <input
          type="range"
          min="-5"
          max="5"
          step="0.1"
          value={a}
          onChange={(e) => setA(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
          <span>-5</span>
          <span>5</span>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Equations Info Panel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-3 w-3 text-white/40" />
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Equations of Motion
          </label>
        </div>
        <div className="p-3 bg-white/[0.03] rounded-none border border-white/10 space-y-3">
          <div className="space-y-1">
            <p className="text-[8px] text-white/40 uppercase font-mono">Velocity-Time</p>
            <div className="font-mono text-[10px] text-white/80 bg-white/[0.03] p-1.5 rounded-none">
              v = u + at
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] text-white/40 uppercase font-mono">Displacement-Time</p>
            <div className="font-mono text-[10px] text-white/80 bg-white/[0.03] p-1.5 rounded-none">
              s = ut + ½at²
            </div>
          </div>
          <p className="text-[8px] text-white/30 italic leading-tight">
            Uniformly accelerated motion in a straight line.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <LabContainer
      id="lab-motion"
      simType="motion"
      title={title || "Linear Motion Lab"}
      description={description || "Explore velocity and acceleration"}
      onReset={handleReset}
      controls={controls}
      sidebarControls={sidebarControls}
      is3D={true}
      className={className}
    >
      <MotionSim
        initialVelocity={u}
        acceleration={a}
        isPlaying={isPlaying}
        onBoundaryReached={() => setIsPlaying(false)}
        resetKey={resetKey}
      />
    </LabContainer>
  );
}
