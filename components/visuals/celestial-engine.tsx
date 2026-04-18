'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { MotionValue, useTransform } from 'framer-motion';
import { BlackHole } from './black-hole';

interface CelestialEngineProps {
  className?: string;
  scrollYProgress: MotionValue<number>;
}

export function CelestialEngine({ className, scrollYProgress }: CelestialEngineProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Morph states: 0 (Singularity), 1 (Sun), 2 (Earth)
  const uMorph = useTransform(scrollYProgress, [0.2, 0.325, 0.45], [0, 1, 2]);

  // 2. Position panning: Center -> Right-side
  const posX = useTransform(scrollYProgress, [0.2, 0.45], [0, 5]);

  // 3. Disk visibility: Only active in Stage 1
  const diskOpacity = useTransform(scrollYProgress, [0.2, 0.3], [1, 0]);
  
  if (!mounted) return <div className={`relative w-full h-full ${className} bg-black`} />;

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffd700" />
        
        <Suspense fallback={null}>
          <BlackHole 
            scrollYProgress={scrollYProgress} 
            uMorph={uMorph}
            posX={posX}
            diskOpacity={diskOpacity}
          />
        </Suspense>

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
