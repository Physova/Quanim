"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, percent)));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[200] h-1 bg-white/5 backdrop-blur-sm group">
      <div
        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-black/80 border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
