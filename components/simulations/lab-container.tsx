"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Loader2, Maximize2, Minimize2, RotateCcw, PanelLeftDashed, X, GripVertical, Share2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/lib/stores/simulation-store";

interface LabContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onReset?: () => void;
  controls?: React.ReactNode;
  sidebarControls?: React.ReactNode;
  is3D?: boolean;
  id?: string;
  simType?: string;
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
  id,
  simType = "unknown",
}: LabContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isSplitMode, setIsSplitMode] = React.useState(false);
  const [splitWidth, setSplitWidth] = React.useState(50);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isDragging = React.useRef(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const { getParamsObject, applyParamsObject } = useSimulationStore();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateId = params.get("state");
    
    if (stateId) {
      fetch(`/api/sim-state?id=${stateId}`)
        .then(res => res.json())
        .then(data => {
          // Only apply if simulation types match
          if (data.params && data.simType === simType) {
            applyParamsObject(data.params);
          }
        })
        .catch(err => console.error("Failed to hydrate state:", err));
    }
  }, [applyParamsObject, simType]);

  const handleShare = async () => {
    setIsSaving(true);
    try {
      const params = getParamsObject();
      const response = await fetch("/api/sim-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simType, params }),
      });
      
      const data = await response.json();
      if (data.id) {
        const url = new URL(window.location.href);
        url.searchParams.set("state", data.id);
        await navigator.clipboard.writeText(url.toString());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to share state:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSplitMode) {
        setIsSplitMode(false);
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.style.removeProperty('--split-width');
      document.body.style.cursor = 'default';
    };
  }, [isSplitMode]);

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
      id={id}
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
        
        <div className={cn("flex items-center gap-2 pointer-events-auto", isSplitMode && "md:mr-32")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            disabled={isSaving}
            className={cn(
              "h-7 w-7 transition-colors rounded-none",
              isCopied ? "text-green-500 bg-green-500/10" : "text-slate-500 hover:text-white hover:bg-white/10"
            )}
            title="Share Simulation State"
          >
            {isCopied ? <Check className="h-3.5 w-3.5" /> : isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
          </Button>
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
        </div>
      </div>

      {/* Sidebar Controls (Optional) */}
      {(sidebarControls || (controls && isFullscreen)) && (
        <div className={cn(
          "absolute top-16 z-30 w-52 max-h-[calc(100%-8rem)] overflow-y-auto p-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-none transition-all duration-500 no-scrollbar", 
          isFullscreen ? "right-6 opacity-100 translate-x-0" : "right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
        )}>
          <div className="space-y-4">            {sidebarControls}
            {isFullscreen && controls && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Controls</span>
                <div className="flex flex-col gap-2 [&>button]:w-full [&>button]:justify-start [&>div[data-slot=separator]]:h-px [&>div[data-slot=separator]]:w-full [&>div[data-slot=separator]]:my-1">
                  {controls}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lab Bottom Controls (Floating) */}
      {controls && !isFullscreen && (
        <div className={cn(
          "absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300"
        )}>
          {controls}
        </div>
      )}

      {/* Floating Exit Split Button */}
      {isSplitMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSplitMode(false)}
          className="absolute top-4 right-4 z-[60] bg-black/80 backdrop-blur-xl border border-white/20 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all rounded-none gap-2 px-4 py-5 h-auto shadow-2xl group/exit"
        >
          <X className="h-4 w-4 transition-transform group-hover/exit:rotate-90" />
          <span className="text-[10px] font-bold tracking-widest uppercase">Exit Split</span>
        </Button>
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
