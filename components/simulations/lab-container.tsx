"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Loader2, Maximize2, Minimize2, RotateCcw, PanelLeftDashed, X, GripVertical } from "lucide-react";
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
  is3D?: boolean;
}

export function LabContainer({
  children,
  title = "Physics Lab",
  description,
  className,
  onReset,
  controls,
  sidebarControls,
  is3D = true,
}: LabContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isSplitMode, setIsSplitMode] = React.useState(false);
  const [splitWidth, setSplitWidth] = React.useState(50);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    if (isSplitMode) {
      document.body.classList.add("split-mode");
      document.body.style.setProperty('--split-width', `${splitWidth}vw`);
    } else {
      document.body.classList.remove("split-mode");
      document.body.style.removeProperty('--split-width');
    }
    
    // IMPORTANT Cleanup on unmount to fix routing bug!
    return () => {
      document.body.classList.remove("split-mode");
      document.body.style.removeProperty('--split-width');
    };
  }, [isSplitMode, splitWidth]);

  const [resetKey, setResetKey] = React.useState(0);
  const handleResetClick = () => {
    setResetKey(prev => prev + 1);
    if (onReset) onReset();
  };
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      setSplitWidth(Math.min(Math.max(newWidth, 20), 80));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.style.removeProperty('--split-width');
      document.body.style.cursor = 'default';
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <Card 
      ref={containerRef}
      style={isSplitMode ? { width: `${splitWidth}vw` } : undefined}
      className={cn(
      "relative overflow-hidden bg-black border border-white/10 group rounded-none transition-[height,left,top,bottom] duration-500",
      isSplitMode ? "fixed inset-y-0 left-0 h-[100dvh] z-[100] border-r-0" : "w-full aspect-video",
      className
    )}>
      {/* Drag Handle for Split Mode */}
      {isSplitMode && (
        <div 
          className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize z-50 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10 group/handle"
          onMouseDown={() => {
            isDragging.current = true;
            document.body.style.cursor = 'col-resize';
          }}
        >
          <GripVertical className="h-4 w-4 text-white/30 group-hover/handle:text-white transition-colors" />
        </div>
      )}
      {/* Lab Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <h3 className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-white/60" />
            {title}
          </h3>
          {description && (
            <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1 font-mono uppercase">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetClick}
              className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={cn(
              "h-7 w-7 transition-colors rounded-none hidden md:flex",
              isSplitMode ? "text-white bg-white/20" : "text-slate-500 hover:text-white hover:bg-white/10"
            )}
            title="Split View Mode"
          >
            <PanelLeftDashed className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/10 transition-colors rounded-none"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
          {isSplitMode && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSplitMode(false)}
            className="h-7 w-7 text-slate-500 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-none ml-2"
            title="Exit Split View"
          >
            <X className="h-4 w-4" />
          </Button>
          )}
        </div>
      </div>

      {/* Sidebar Controls (Optional) */}
      {sidebarControls && (
        <div className="absolute top-16 right-4 z-30 w-48 max-h-[calc(100%-6rem)] overflow-y-auto p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="space-y-4">
            {sidebarControls}
          </div>
        </div>
      )}

      {/* Lab Bottom Controls (Floating) */}
      {controls && (
        <div className={cn(
          "absolute bottom-6 z-30 flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300",
          isFullscreen ? "left-6 translate-x-0" : "left-1/2 -translate-x-1/2"
        )}>
          {controls}
        </div>
      )}

      {/* Simulation Canvas/Content */}
      <div className="w-full h-full cursor-crosshair">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full bg-black">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
              <span className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">Initializing Engine...</span>
            </div>
          </div>
        }>
          {is3D ? (
            <Canvas key={resetKey} shadows gl={{ antialias: true, alpha: true }}>
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
          ) : (
            <div className="w-full h-full relative z-0">
              {children}
            </div>
          )}
        </Suspense>
      </div>

      {/* Lab Overlay/Status */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 border border-white/10 rounded-none text-[9px] font-mono text-white/40 tracking-wider">
            SYSTEM.READY
            </div>
            <div className="px-2 py-0.5 border border-white/10 rounded-none text-[9px] font-mono text-white/30 tracking-wider">
            V.2.0.4-BETA
            </div>
        </div>
      </div>

      {/* Scanline/Grid FX */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
    </Card>
  );
}
