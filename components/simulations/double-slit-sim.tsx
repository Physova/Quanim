"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "@/lib/stores/simulation-store";

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uWavelength;
  uniform float uSlitDistance;
  uniform int uObserverMode; // 0: none, 1: observed
  uniform bool uWaveMode;

  vec3 wavelengthToColor(float wavelength) {
    // Simplified conversion from wavelength (nm) to RGB
    // 380-440: Violet, 440-490: Blue, 490-510: Cyan, 510-580: Green, 580-645: Yellow, 645-780: Red
    float r, g, b;
    if (wavelength < 440.0) {
      r = -(wavelength - 440.0) / (440.0 - 380.0); g = 0.0; b = 1.0;
    } else if (wavelength < 490.0) {
      r = 0.0; g = (wavelength - 440.0) / (490.0 - 440.0); b = 1.0;
    } else if (wavelength < 510.0) {
      r = 0.0; g = 1.0; b = -(wavelength - 510.0) / (510.0 - 490.0);
    } else if (wavelength < 580.0) {
      r = (wavelength - 510.0) / (580.0 - 510.0); g = 1.0; b = 0.0;
    } else if (wavelength < 645.0) {
      r = 1.0; g = -(wavelength - 645.0) / (645.0 - 580.0); b = 0.0;
    } else {
      r = 1.0; g = 0.0; b = 0.0;
    }
    return vec3(r, g, b);
  }

  void main() {
    vec2 uv = vUv;
    float d1 = distance(uv, vec2(0.3, 0.5 - uSlitDistance * 0.05));
    float d2 = distance(uv, vec2(0.3, 0.5 + uSlitDistance * 0.05));
    
    // Phase calculation: k * d - omega * t
    // k = 2 * PI / wavelength
    float k = 1000.0 / uWavelength; // Scaled k
    float phase1 = d1 * k * 40.0 - uTime * 5.0;
    float phase2 = d2 * k * 40.0 - uTime * 5.0;
    
    float wave1 = sin(phase1);
    float wave2 = sin(phase2);
    
    // Pattern on the screen (right side)
    float screenX = 0.85;
    float distToScreen = abs(uv.x - screenX);
    float screenPattern = 0.0;
    
    // The "observer" collapses the wave function
    bool isObserved = (uObserverMode > 0);
    bool showInterference = !isObserved && uWaveMode;

    float y = uv.y - 0.5;
    float angleScale = 1500.0 / uWavelength; // Smaller wavelength = finer pattern
    
    if (showInterference) {
      // Interference pattern: I = I0 * cos^2( (pi*d*sin(theta)) / lambda )
      // sin(theta) ~ y / distance
      float d = uSlitDistance;
      float interferenceFactor = cos( (3.14159 * d * y * angleScale) / 10.0 );
      screenPattern = pow(interferenceFactor, 2.0) * exp(-y * y * 50.0);
    } else {
      // Two individual bands (particle behavior)
      float offset = uSlitDistance * 0.1;
      screenPattern = (exp(-pow(y - offset, 2.0) * 400.0) + exp(-pow(y + offset, 2.0) * 400.0));
      if (isObserved) screenPattern *= 0.8; // Observed pattern is often dimmer in simulations
    }

    vec3 baseColor = wavelengthToColor(uWavelength);
    vec3 accentColor = vec3(1.0, 0.8, 0.2); // Amber/Gold for "Energy"
    
    vec3 color = vec3(0.01, 0.02, 0.05); // Dark deep blue bg

    if (uv.x > screenX) {
      // Screen visualization
      color = mix(color, baseColor * 2.0, screenPattern * uIntensity);
      color = mix(color, accentColor, screenPattern * uIntensity * 0.3);
    } else if (uv.x > 0.3) {
      // Wave propagation area
      float mask = smoothstep(0.3, 0.7, uv.x) * (1.0 - smoothstep(0.8, 0.85, uv.x));
      float interference = (wave1 + wave2) * 0.5;
      
      if (showInterference) {
        color += baseColor * interference * mask * 0.4;
      } else {
        // Show individual rays/waves if observed or not in wave mode
        float ray1 = exp(-pow(uv.y - (0.5 - uSlitDistance * 0.05), 2.0) * 500.0);
        float ray2 = exp(-pow(uv.y - (0.5 + uSlitDistance * 0.05), 2.0) * 500.0);
        color += baseColor * (wave1 * ray1 + wave2 * ray2) * mask * 0.5;
      }
    }
    
    // Slit mask visualization
    if (abs(uv.x - 0.3) < 0.005) {
      float s1 = 0.5 - uSlitDistance * 0.05;
      float s2 = 0.5 + uSlitDistance * 0.05;
      if (abs(uv.y - s1) < 0.015 || abs(uv.y - s2) < 0.015) {
        color = vec3(1.0); // Open slits
      } else {
        color = vec3(0.1, 0.1, 0.15); // Closed part of mask
      }
    }

    // Observer indicator
    if (uObserverMode > 0 && uv.x > 0.35 && uv.x < 0.4) {
      float obsY = (uObserverMode == 1) ? 0.5 - uSlitDistance * 0.05 : 0.5 + uSlitDistance * 0.05;
      if (uObserverMode == 3) {
         // Show both if mode is 3
         if (distance(uv, vec2(0.37, 0.5 - uSlitDistance * 0.05)) < 0.02 || 
             distance(uv, vec2(0.37, 0.5 + uSlitDistance * 0.05)) < 0.02) {
           color = vec3(1.0, 0.0, 0.0); // Red dot for observer
         }
      } else {
        if (distance(uv, vec2(0.37, obsY)) < 0.02) {
          color = vec3(1.0, 0.0, 0.0); // Red dot for observer
        }
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function DoubleSlitSim() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isPlaying, waveMode, intensity, wavelength, slitDistance, observerState, reset, clearReset } = useSimulationStore();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uWavelength: { value: wavelength },
    uSlitDistance: { value: slitDistance },
    uObserverMode: { value: 0 },
    uWaveMode: { value: waveMode },
  }), [intensity, wavelength, slitDistance, waveMode]);

  useEffect(() => {
    if (reset) {
      // In a real simulation, we might reset particle systems here
      clearReset();
    }
  }, [reset, clearReset]);

  useFrame((state) => {
    if (meshRef.current && isPlaying) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uWavelength.value = wavelength;
      material.uniforms.uSlitDistance.value = slitDistance;
      material.uniforms.uWaveMode.value = waveMode;
      
      let obsMode = 0;
      if (observerState === "left") obsMode = 1;
      else if (observerState === "right") obsMode = 2;
      else if (observerState === "both") obsMode = 3;
      material.uniforms.uObserverMode.value = obsMode;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0, 0]}>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
