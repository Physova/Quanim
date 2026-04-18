"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Loader2, Maximize2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LabContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onReset?: () => void;
  controls?: React.ReactNode;
  sidebarControls?: React.ReactNode;
}

export function LabContainer({
  children,
  title = "Physics Lab",
  description,
  className,
  onReset,
  controls,
  sidebarControls,
}: LabContainerProps) {
  return (
    <Card className={cn(
      "relative w-full aspect-video overflow-hidden bg-slate-950/50 backdrop-blur-md border-slate-800 shadow-2xl group",
      className
    )}>
      {/* Lab Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-tighter flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {title}
          </h3>
          {description && (
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-mono uppercase">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-7 w-7 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Controls (Optional) */}
      {sidebarControls && (
        <div className="absolute top-16 right-4 z-20 w-48 max-h-[calc(100%-6rem)] overflow-y-auto p-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="space-y-4">
            {sidebarControls}
          </div>
        </div>
      )}

      {/* Lab Bottom Controls (Floating) */}
      {controls && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {controls}
        </div>
      )}

      {/* Simulation Canvas */}
      <div className="w-full h-full cursor-crosshair">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full bg-slate-950">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <span className="text-[10px] font-mono text-amber-500/50 tracking-widest uppercase">Initializing Engine...</span>
            </div>
          </div>
        }>
          <Canvas shadows gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            <OrbitControls 
              enablePan={false}
              maxDistance={15}
              minDistance={3}
              enableDamping
            />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <Environment preset="night" />
            
            {children}
          </Canvas>
        </Suspense>
      </div>

      {/* Lab Overlay/Status */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-500 tracking-wider">
            SYSTEM.READY
            </div>
            <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-mono text-blue-400 tracking-wider">
            V.2.0.4-BETA
            </div>
        </div>
      </div>

      {/* Scanline/Grid FX */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
    </Card>
  );
}
