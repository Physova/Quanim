"use client";

import React, { useRef, useEffect } from "react";
import { useSimulationStore } from "@/lib/stores/simulation-store";

const BASE_WIDTH = 1100;
const BASE_HEIGHT = 550;

export default function EntanglementSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const entanglementAnimRef = useRef(0);
  const measureAnimARef = useRef(0);
  const measureAnimBRef = useRef(0);

  const {
    isEntangled,
    isMeasuredA,
    isMeasuredB,
    reset,
  } = useSimulationStore();

  interface ConnectionParticle {
    t: number;
    offset: number;
    speed: number;
    size: number;
  }
  const connectionParticlesRef = useRef<ConnectionParticle[]>([]);

  // Colors based on the project aesthetic (dark mode)
  const colors = React.useMemo(() => ({
    bg: [0, 0, 0], // Pure black
    text: [255, 255, 255], // White
    accent: [255, 255, 255],
    particleA: [255, 255, 255], // White
    particleB: [150, 150, 150], // Mid Grey
    entanglement: [255, 255, 255], // White
  }), []);

  // Initialize connection particles once
  useEffect(() => {
    const particles: ConnectionParticle[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        t: Math.random(),
        offset: Math.random() * 2 - 1,
        speed: Math.random() * 0.006 + 0.002,
        size: Math.random() * 3 + 2,
      });
    }
    connectionParticlesRef.current = particles;
  }, []);

  // Use a single stable render loop driven by requestAnimationFrame
  // Reading from store via getState() inside the loop to avoid stale closures
  useEffect(() => {
    const render = () => {
      const store = useSimulationStore.getState();
      const {
        isPlaying,
        isEntangled,
        isMeasuredA,
        isMeasuredB,
        measuredStateA,
        measuredStateB,
        entanglementDistance,
      } = store;

      if (!isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      timeRef.current += 0.02;
      const time = timeRef.current;

      // Decay animations
      if (measureAnimARef.current > 0) {
        measureAnimARef.current = Math.max(0, measureAnimARef.current - 0.02);
      }
      if (measureAnimBRef.current > 0) {
        measureAnimBRef.current = Math.max(0, measureAnimBRef.current - 0.02);
      }
      if (entanglementAnimRef.current > 0) {
        entanglementAnimRef.current = Math.max(0, entanglementAnimRef.current - 0.015);
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const scaleFactor = width / 800;
      const s = (val: number) => val * scaleFactor;

      // Draw background
      ctx.fillStyle = `rgb(${colors.bg.join(",")})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - s(40);
      const dist = s(entanglementDistance);

      const pA = { x: centerX - dist / 2, y: centerY };
      const pB = { x: centerX + dist / 2, y: centerY };

      const rgba = (rgb: number[], a: number) => `rgba(${rgb.join(",")}, ${a})`;

      // Draw Connection
      if (isEntangled) {
        const connectionAlpha = (isMeasuredA && isMeasuredB) ? 0.2 : 0.6;
        ctx.strokeStyle = rgba(colors.entanglement, connectionAlpha);
        ctx.lineWidth = s(2);
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const x = pA.x + (pB.x - pA.x) * t;
          const waveAmp = s(20) * Math.sin(t * Math.PI) * (1 - entanglementAnimRef.current);
          const y = pA.y + Math.sin(time * 2 + t * Math.PI * 6) * waveAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Particles flowing
        if (!isMeasuredA || !isMeasuredB) {
          connectionParticlesRef.current.forEach((p) => {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
            const x = pA.x + (pB.x - pA.x) * p.t;
            const waveAmp = s(20) * Math.sin(p.t * Math.PI);
            const y = pA.y + Math.sin(time * 2 + p.t * Math.PI * 6) * waveAmp + p.offset * s(10);
            const alpha = Math.sin(p.t * Math.PI) * 0.8;
            ctx.fillStyle = rgba(colors.entanglement, alpha);
            ctx.beginPath();
            ctx.arc(x, y, s(p.size / 2), 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      // Draw Particles
      const drawParticle = (
        pos: { x: number; y: number },
        label: string,
        particleIsMeasured: boolean,
        state: number,
        anim: number,
        particleColor: number[]
      ) => {
        if (!isEntangled) {
          ctx.strokeStyle = rgba(colors.text, 0.2);
          ctx.setLineDash([s(5), s(5)]);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, s(40), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = rgba(colors.text, 0.4);
          ctx.font = `${Math.round(s(24))}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, pos.x, pos.y);
          return;
        }

        if (!particleIsMeasured) {
          const pulse = Math.sin(time * 2 + (label === 'A' ? 0 : Math.PI)) * 0.15 + 1;
          for (let r = s(50) * pulse; r > 0; r -= s(4)) {
            const alpha = (1 - r / (s(50) * pulse)) * 0.3;
            ctx.fillStyle = rgba(particleColor, alpha);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
            ctx.fill();
          }

          for (let i = 0; i < 8; i++) {
            const angle = time + i * (Math.PI * 2) / 8 + (label === 'A' ? 0 : Math.PI / 8);
            const radius = s(25) + Math.sin(time * 3 + i) * s(8);
            const px = pos.x + Math.cos(angle) * radius;
            const py = pos.y + Math.sin(angle) * radius;
            ctx.fillStyle = rgba(particleColor, 0.4);
            ctx.beginPath();
            ctx.arc(px, py, s(3), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, s(10), 0, Math.PI * 2);
          ctx.fill();

          const upAlpha = (Math.sin(time * 2) + 1) / 2 * 0.6 + 0.2;
          const downAlpha = (Math.sin(time * 2 + Math.PI) + 1) / 2 * 0.6 + 0.2;

          ctx.strokeStyle = rgba(particleColor, upAlpha);
          ctx.lineWidth = s(2);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y - s(15));
          ctx.lineTo(pos.x, pos.y - s(25));
          ctx.lineTo(pos.x - s(4), pos.y - s(21));
          ctx.moveTo(pos.x, pos.y - s(25));
          ctx.lineTo(pos.x + s(4), pos.y - s(21));
          ctx.stroke();

          ctx.strokeStyle = rgba(particleColor, downAlpha);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y + s(15));
          ctx.lineTo(pos.x, pos.y + s(25));
          ctx.lineTo(pos.x - s(4), pos.y + s(21));
          ctx.moveTo(pos.x, pos.y + s(25));
          ctx.lineTo(pos.x + s(4), pos.y + s(21));
          ctx.stroke();

        } else {
          if (anim > 0.5) {
            const flashAlpha = (anim - 0.5) * 2;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, s(75), 0, Math.PI * 2);
            ctx.fill();
          }

          const pulse = Math.sin(time * 3) * 0.1 + 1;
          const size = s(40) * pulse;

          for (let r = size; r > 0; r -= s(3)) {
            const alpha = (1 - r / size) * 0.8;
            ctx.fillStyle = rgba(particleColor, alpha);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, s(9), 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = rgba(particleColor, 0.9);
          ctx.lineWidth = s(3);
          const arrowSize = s(18);
          if (state === 0) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y - s(15));
            ctx.lineTo(pos.x, pos.y - s(15) - arrowSize);
            ctx.lineTo(pos.x - s(5), pos.y - s(15) - arrowSize + s(6));
            ctx.moveTo(pos.x, pos.y - s(15) - arrowSize);
            ctx.lineTo(pos.x + s(5), pos.y - s(15) - arrowSize + s(6));
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y + s(15));
            ctx.lineTo(pos.x, pos.y + s(15) + arrowSize);
            ctx.lineTo(pos.x - s(5), pos.y + s(15) + arrowSize - s(6));
            ctx.moveTo(pos.x, pos.y + s(15) + arrowSize);
            ctx.lineTo(pos.x + s(5), pos.y + s(15) + arrowSize - s(6));
            ctx.stroke();
          }
        }

        // Labels
        ctx.fillStyle = rgba(particleColor, 1);
        ctx.font = `bold ${Math.round(s(12))}px Inter`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`Particle ${label}`, pos.x, pos.y + s(55));

        ctx.fillStyle = rgba(colors.text, 0.6);
        ctx.font = `${Math.round(s(10))}px Inter`;
        if (particleIsMeasured) {
          ctx.fillText(state === 0 ? "Spin: ↑ (Up)" : "Spin: ↓ (Down)", pos.x, pos.y + s(70));
        } else if (isEntangled) {
          ctx.fillText("State: |↑⟩ + |↓⟩", pos.x, pos.y + s(70));
        }
      };

      drawParticle(pA, "A", isMeasuredA, measuredStateA, measureAnimARef.current, colors.particleA);
      drawParticle(pB, "B", isMeasuredB, measuredStateB, measureAnimBRef.current, colors.particleB);

      // Correlation Graph
      const graphTop = height - s(120);
      const graphBottom = height - s(20);
      const midX = width / 2;

      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.roundRect(s(50), graphTop - s(20), width - s(100), s(110), s(10));
      ctx.fill();

      ctx.fillStyle = rgba(colors.text, 0.8);
      ctx.font = `${Math.round(s(12))}px Inter`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Measurement Correlation", midX, graphTop - s(5));

      const barWidth = s(30);
      const maxBarH = s(50);
      const gap = s(40);

      const ax = midX - gap - barWidth;
      let ahUp = maxBarH * 0.5;
      let ahDown = maxBarH * 0.5;
      if (isMeasuredA) {
        ahUp = measuredStateA === 0 ? maxBarH : 0;
        ahDown = measuredStateA === 1 ? maxBarH : 0;
      }

      ctx.fillStyle = rgba(colors.particleA, 0.8);
      ctx.fillRect(ax - barWidth / 2, graphBottom - s(20) - ahUp, barWidth / 2 - 1, ahUp);
      ctx.fillStyle = rgba(colors.particleA, 0.4);
      ctx.fillRect(ax + 1, graphBottom - s(20) - ahDown, barWidth / 2 - 1, ahDown);

      const bx = midX + gap + barWidth;
      let bhUp = maxBarH * 0.5;
      let bhDown = maxBarH * 0.5;
      if (isMeasuredB) {
        bhUp = measuredStateB === 0 ? maxBarH : 0;
        bhDown = measuredStateB === 1 ? maxBarH : 0;
      }

      ctx.fillStyle = rgba(colors.particleB, 0.8);
      ctx.fillRect(bx - barWidth / 2, graphBottom - s(20) - bhUp, barWidth / 2 - 1, bhUp);
      ctx.fillStyle = rgba(colors.particleB, 0.4);
      ctx.fillRect(bx + 1, graphBottom - s(20) - bhDown, barWidth / 2 - 1, bhDown);

      ctx.fillStyle = rgba(colors.text, 0.4);
      ctx.font = `${Math.round(s(8))}px Inter`;
      ctx.fillText("↑", ax - s(8), graphBottom - s(10));
      ctx.fillText("↓", ax + s(8), graphBottom - s(10));
      ctx.fillText("↑", bx - s(8), graphBottom - s(10));
      ctx.fillText("↓", bx + s(8), graphBottom - s(10));

      ctx.fillStyle = rgba(colors.entanglement, 0.9);
      ctx.font = `${Math.round(s(10))}px Inter`;
      if (isEntangled) {
        if (isMeasuredA && isMeasuredB) {
          ctx.fillText("Correlation: 100%", midX, graphTop + s(30));
          ctx.fillText("Always opposite!", midX, graphTop + s(45));
        } else {
          ctx.fillText("Correlation: Pending", midX, graphTop + s(30));
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [colors]); // Only depends on colors (which is memoized and stable)

  // Trigger animations via refs when store values change
  useEffect(() => {
    if (isMeasuredA) measureAnimARef.current = 1;
  }, [isMeasuredA]);

  useEffect(() => {
    if (isMeasuredB) measureAnimBRef.current = 1;
  }, [isMeasuredB]);

  useEffect(() => {
    if (isEntangled) entanglementAnimRef.current = 1;
  }, [isEntangled]);

  useEffect(() => {
    if (reset) {
      entanglementAnimRef.current = 0;
      measureAnimARef.current = 0;
      measureAnimBRef.current = 0;
      timeRef.current = 0;
    }
  }, [reset]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-none overflow-hidden border border-white/10 relative">
      <canvas
        ref={canvasRef}
        width={BASE_WIDTH}
        height={BASE_HEIGHT}
        className="w-full h-full object-contain"
      />
      <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
        CANVAS_2D_ENGINE :: ENTANGLEMENT_SIM
      </div>
    </div>
  );
}
