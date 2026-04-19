"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSimulationStore } from "@/lib/stores/simulation-store";

const SuperpositionSim = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    probUp, 
    isMeasured, 
    measuredState, 
    setIsMeasured, 
    reset,
    clearReset
  } = useSimulationStore();
  
  const [measurementAnimation, setMeasurementAnimation] = useState(0);

  // Constants
  const colors = React.useMemo(() => ({
    bg: "#0f172a",
    text: "#e2e8f0",
    stateUp: "#3b82f6",    // Blue
    stateDown: "#f97316",  // Orange
    core: "#fffff0"
  }), []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbUp = React.useMemo(() => hexToRgb(colors.stateUp), [colors.stateUp]);
  const rgbDown = React.useMemo(() => hexToRgb(colors.stateDown), [colors.stateDown]);

  useEffect(() => {
    if (reset) {
      setMeasurementAnimation(0);
      setIsMeasured(false);
      clearReset();
    }
  }, [reset, setIsMeasured, clearReset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let internalTime = 0;
    let internalAnimation = measurementAnimation;

    const draw = () => {
      internalTime += 0.02;
      
      if (internalAnimation > 0) {
        internalAnimation = Math.max(0, internalAnimation - 0.02);
        setMeasurementAnimation(internalAnimation);
      }

      const width = canvas.width;
      const height = canvas.height;
      const scaleFactor = width / 800; // Reference width 800
      const s = (val: number) => val * scaleFactor;

      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height * 0.4;
      const probDown = 1 - probUp;

      if (!isMeasured) {
        // Superposition state
        const pulseUp = Math.sin(internalTime * 2) * 0.15 + 1;
        const pulseDown = Math.sin(internalTime * 2 + Math.PI) * 0.15 + 1;

        // Spin up cloud (blue)
        const upY = cy - s(60);
        const upSize = s(120) * probUp * pulseUp;
        for (let r = upSize; r > 0; r -= s(8)) {
          const alpha = (1 - r / upSize) * 0.7 * probUp;
          ctx.fillStyle = `rgba(${rgbUp.r}, ${rgbUp.g}, ${rgbUp.b}, ${alpha})`;
          ctx.beginPath();
          ctx.ellipse(cx, upY, r * 0.75, r / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spin down cloud (orange)
        const downY = cy + s(60);
        const downSize = s(120) * probDown * pulseDown;
        for (let r = downSize; r > 0; r -= s(8)) {
          const alpha = (1 - r / downSize) * 0.7 * probDown;
          ctx.fillStyle = `rgba(${rgbDown.r}, ${rgbDown.g}, ${rgbDown.b}, ${alpha})`;
          ctx.beginPath();
          ctx.ellipse(cx, downY, r * 0.75, r / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Central core
        const blendFactor = (Math.sin(internalTime * 3) + 1) / 2;
        const coreR = Math.floor(rgbUp.r + (rgbDown.r - rgbUp.r) * blendFactor);
        const coreG = Math.floor(rgbUp.g + (rgbDown.g - rgbUp.g) * blendFactor);
        const coreB = Math.floor(rgbUp.b + (rgbDown.b - rgbUp.b) * blendFactor);

        const coreRadius = s(40);
        for (let r = coreRadius; r > 0; r -= s(5)) {
          const alpha = (1 - r / coreRadius) * 0.5 + 0.3;
          ctx.fillStyle = `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fluctuations
        for (let i = 0; i < 20; i++) {
          const angle = internalTime * 0.5 + (i * Math.PI * 2) / 20;
          const radius = s(80) + Math.sin(internalTime * 2 + i) * s(20);
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius * 0.6;

          const pColor = i % 2 === 0 ? rgbUp : rgbDown;
          ctx.fillStyle = `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, 0.4)`;
          ctx.beginPath();
          ctx.arc(px, py, s(3), 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Equation text
        ctx.fillStyle = colors.text;
        ctx.font = `${Math.floor(s(24))}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("|ψ⟩ = α|↑⟩ + β|↓⟩", cx, cy + s(180));

      } else {
        // Collapsed state
        // Flash
        if (internalAnimation > 0.5) {
          const flashAlpha = (internalAnimation - 0.5) * 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, s(150), 0, Math.PI * 2);
          ctx.fill();
        }

        const stateColor = measuredState === 0 ? rgbUp : rgbDown;
        const stateLabel = measuredState === 0 ? "|↑⟩" : "|↓⟩";
        const pulse = Math.sin(internalTime * 3) * 0.1 + 1;
        const size = s(100) * pulse;

        for (let r = size; r > 0; r -= s(6)) {
          const alpha = (1 - r / size) * 0.8 + 0.2;
          ctx.fillStyle = `rgba(${stateColor.r}, ${stateColor.g}, ${stateColor.b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, r / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core
        ctx.fillStyle = colors.core;
        ctx.beginPath();
        ctx.arc(cx, cy, s(10), 0, Math.PI * 2);
        ctx.fill();

        // Arrow
        ctx.strokeStyle = `rgb(${stateColor.r}, ${stateColor.g}, ${stateColor.b})`;
        ctx.lineWidth = s(4);
        const arrowSize = s(50);
        ctx.beginPath();
        if (measuredState === 0) {
          ctx.moveTo(cx, cy - s(60));
          ctx.lineTo(cx, cy - s(60) - arrowSize);
          ctx.lineTo(cx - s(15), cy - s(60) - arrowSize + s(20));
          ctx.moveTo(cx, cy - s(60) - arrowSize);
          ctx.lineTo(cx + s(15), cy - s(60) - arrowSize + s(20));
        } else {
          ctx.moveTo(cx, cy + s(60));
          ctx.lineTo(cx, cy + s(60) + arrowSize);
          ctx.lineTo(cx - s(15), cy + s(60) + arrowSize - s(20));
          ctx.moveTo(cx, cy + s(60) + arrowSize);
          ctx.lineTo(cx + s(15), cy + s(60) + arrowSize - s(20));
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = colors.text;
        ctx.font = `${Math.floor(s(28))}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(stateLabel, cx, cy + s(180));
        
        ctx.font = `${Math.floor(s(14))}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
        ctx.fillText("Wavefunction collapsed!", cx, cy + s(210));
      }

      // Probability Graph
      const graphY = height * 0.75;
      const graphMidX = width / 2;
      const barWidth = s(50);
      const maxBarHeight = s(100);

      // Graph container
      ctx.fillStyle = "rgba(30, 41, 59, 0.5)";
      ctx.strokeStyle = "rgba(226, 232, 240, 0.1)";
      ctx.lineWidth = 1;
      const graphW = s(300);
      const graphH = s(150);
      ctx.beginPath();
      ctx.roundRect(graphMidX - graphW / 2, graphY, graphW, graphH, s(10));
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.font = `${Math.floor(s(12))}px Inter, sans-serif`;
      ctx.fillText("Probability Distribution", graphMidX, graphY + s(25));

      // Bars
      const upHeight = maxBarHeight * (isMeasured ? (measuredState === 0 ? 1 : 0) : probUp);
      const downHeight = maxBarHeight * (isMeasured ? (measuredState === 1 ? 1 : 0) : probDown);

      ctx.fillStyle = colors.stateUp;
      ctx.beginPath();
      ctx.roundRect(graphMidX - barWidth - s(20), graphY + graphH - s(30) - upHeight, barWidth, upHeight, s(4));
      ctx.fill();

      ctx.fillStyle = colors.stateDown;
      ctx.beginPath();
      ctx.roundRect(graphMidX + s(20), graphY + graphH - s(30) - downHeight, barWidth, downHeight, s(4));
      ctx.fill();

      // Labels
      ctx.fillStyle = colors.text;
      ctx.fillText("|↑⟩", graphMidX - barWidth / 2 - s(20), graphY + graphH - s(10));
      ctx.fillText("|↓⟩", graphMidX + barWidth / 2 + s(20), graphY + graphH - s(10));

      ctx.fillText(
        `${Math.round((isMeasured ? (measuredState === 0 ? 1 : 0) : probUp) * 100)}%`,
        graphMidX - barWidth / 2 - s(20),
        graphY + graphH - s(40) - upHeight
      );
      ctx.fillText(
        `${Math.round((isMeasured ? (measuredState === 1 ? 1 : 0) : probDown) * 100)}%`,
        graphMidX + barWidth / 2 + s(20),
        graphY + graphH - s(40) - downHeight
      );

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [probUp, isMeasured, measuredState, measurementAnimation, rgbUp, rgbDown, colors.bg, colors.text, colors.core, colors.stateUp, colors.stateDown]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = Math.max(500, container.clientWidth * 0.7);
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950/50 rounded-xl border border-white/10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default SuperpositionSim;
