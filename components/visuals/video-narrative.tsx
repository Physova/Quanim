'use client';

import React, { useRef, useEffect } from 'react';
import { MotionValue } from 'framer-motion';

interface VideoNarrativeProps {
  src: string;
  scrollYProgress: MotionValue<number>;
  className?: string;
}

/**
 * VideoNarrative Component
 * Scrubs a video timeline based on scroll position.
 * Perfectly synced with the 12s/720frame masterpiece asset.
 */
export function VideoNarrative({ src, scrollYProgress, className }: VideoNarrativeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video time to scroll progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // We don't want the video to play itself
    video.pause();

    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (video.duration) {
        // Map 0-1 scroll progress to 0-Duration video time
        video.currentTime = latest * video.duration;
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
      />
      {/* Cinematic overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>
  );
}
