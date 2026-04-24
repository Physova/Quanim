"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Loader2, Maximize2, Minimize2, RotateCcw, PanelLeftDashed, GripVertical, Share2, Check } from "lucide-react";

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
  const [splitWidth] = React.useState(50);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const isDragging = React.useRef(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const { getParamsObject, applyParamsObject } = useSimulationStore();

  const [isPseudoFullscreen, setIsPseudoFullscreen] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateId = params.get("state");
    const shouldFullscreen = params.get("fullscreen") === "true";
    
    if (stateId) {
      fetch(`/api/sim-state?id=${stateId}`)
        .then(res => res.json())
        .then(data => {
          if (data.params && data.simType === simType) {
            applyParamsObject(data.params);
          }
        })
        .catch(err => console.error("Failed to hydrate state:", err));
    }

    if (shouldFullscreen) {
      setIsPseudoFullscreen(true);
    }
  }, [applyParamsObject, simType]);

  // Hide navbar in FS mode
  React.useEffect(() => {
    const navbar = document.querySelector('header');
    if (isPseudoFullscreen || isFullscreen) {
      if (navbar) navbar.style.display = 'none';
    } else {
      if (navbar) navbar.style.display = 'flex';
    }
    return () => {
      if (navbar) navbar.style.display = 'flex';
    };
  }, [isPseudoFullscreen, isFullscreen]);

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
        url.searchParams.set("fullscreen", "true");
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
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSplitMode) setIsSplitMode(false);
        if (isPseudoFullscreen) setIsPseudoFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSplitMode, isPseudoFullscreen]);

  const toggleFullscreen = () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {
        setIsPseudoFullscreen(true);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      id={id}
      style={{ 
        width: isSplitMode ? `${splitWidth}vw` : undefined
      }}
      className={cn(
      "relative flex flex-col overflow-hidden bg-black border border-white/10 group rounded-none transition-[height,left,top,bottom] duration-500",
      isSplitMode ? "fixed inset-y-0 left-0 h-[100dvh] z-[100] border-r-0" : 
      isPseudoFullscreen ? "fixed inset-0 h-[100dvh] w-screen z-[1000] border-0" :
      "w-full aspect-video",
      className
    )}>
      {isSplitMode && (
        <div 
          className="absolute top-0 bottom-0 right-0 w-2 cursor-col-resize z-50 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10"
          onMouseDown={() => {
            isDragging.current = true;
          }}
        >
          <GripVertical className="h-4 w-4 text-white/30" />
        </div>
      )}
      
      {/* Lab Header - HARD ANCHORED TO TOP 0 */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-2 bg-gradient-to-b from-black to-transparent pointer-events-none">
        <div className="pointer-events-auto max-w-[40%] flex flex-col justify-start">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 truncate">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-none bg-white/60 shadow-[0_0_5px_white]" />
            <span className="truncate">{title}</span>
          </div>
          {description && (
            <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1 font-mono uppercase truncate">
              {description}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            disabled={isSaving}
            className="h-7 w-7 transition-colors rounded-none text-white/40 hover:text-white hover:bg-white/5"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
          </Button>
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetClick}
              className="h-7 w-7 transition-colors rounded-none text-white/40 hover:text-white hover:bg-white/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={cn(
              "h-7 w-7 transition-colors rounded-none hidden md:flex text-white/40 hover:text-white hover:bg-white/5",
              isSplitMode && "text-white bg-white/10"
            )}
          >
            <PanelLeftDashed className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-7 w-7 transition-colors rounded-none text-white/40 hover:text-white hover:bg-white/5"
          >
            {isFullscreen || isPseudoFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Controls - Shifted UP to top-10 since header is smaller */}
      {(sidebarControls || (controls && isFullscreen)) && (
        <div className={cn(
          "absolute top-10 z-50 w-52 max-h-[calc(100%-4rem)] overflow-y-auto p-4 bg-black/95 backdrop-blur-xl border border-white/10 rounded-none transition-all duration-500 no-scrollbar", 
          isFullscreen ? "right-4 opacity-100" : "right-2 opacity-0 group-hover:opacity-100"
        )}>
          <div className="space-y-4">
            {sidebarControls}
            {isFullscreen && controls && (
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Controls</span>
                <div className="flex flex-col gap-2 [&>button]:w-full [&>button]:justify-start">
                  {controls}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulation Canvas */}
      <div className="w-full h-full cursor-crosshair">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full bg-black">
            <Loader2 className="h-8 w-8 text-white/20 animate-spin" />
          </div>
        }>
          {is3D ? (
            <Canvas key={resetKey} shadows gl={{ antialias: true, alpha: true }}>
              <PerspectiveCamera makeDefault position={[0, 0, 10]} />
              <OrbitControls enablePan={false} maxDistance={15} minDistance={3} enableDamping />
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} intensity={2} />
              {children}
            </Canvas>
          ) : (
            <div className="w-full h-full relative z-0">{children}</div>
          )}
        </Suspense>
      </div>

      {/* Lab Overlay/Status */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex gap-2">
        <div className="px-2 py-0.5 border border-white/10 text-[9px] font-mono text-white/40 tracking-wider">SYSTEM.READY</div>
        <div className="px-2 py-0.5 border border-white/10 text-[9px] font-mono text-white/30 tracking-wider">V.2.0.4</div>
      </div>
      
      {/* Scanline/Grid FX */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
    </div>
  );
}
