/**
 * GLSL Shaders for Celestial Morphing Sequence
 * Drafted for Quanim Stage 1 (Black Hole) and Stage 2 (Sun/Earth)
 */

export const AccretionDiskShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: null }, // Potential for dynamic color
    uOpacity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex 2D noise for swirling gas texture
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 g = a0 * vec3(x0.x,x12.xz) + h * vec3(x0.y,x12.yw);
      vec3 l = 1.79284291400159 - 0.85373472095314 * ( g*g + h*h );
      vec3 r = vec3(0.0);
      r.x = g.x * l.x;
      r.y = g.y * l.y;
      r.z = g.z * l.z;
      return 130.0 * dot(m, r);
    }

    void main() {
      // Calculate polar coordinates for rotation
      float dist = length(vPosition.xz);
      float angle = atan(vPosition.z, vPosition.x);
      
      // Swirling noise effect
      float n = snoise(vec2(dist * 1.5 - uTime * 0.3, angle * 1.0 + uTime * 0.1));
      n += 0.5 * snoise(vec2(dist * 3.0, angle * 2.0 - uTime * 0.2));
      
      // Accretion disk color palette (Fire/Energy)
      vec3 colorInner = vec3(1.0, 0.4, 0.1); // Bright Orange
      vec3 colorOuter = vec3(0.5, 0.1, 0.8); // Violet fade
      vec3 colorCore = vec3(1.0, 0.9, 0.5);  // Yellow/White heat
      
      // Radial falloff: 
      // Bright at the inner edge (near event horizon), fades out, 
      // but also fades at the very center (the black hole gap)
      float radialMask = smoothstep(1.2, 1.8, dist) * (1.0 - smoothstep(4.5, 7.0, dist));
      
      vec3 finalColor = mix(colorInner, colorCore, n * 0.5 + 0.5);
      finalColor = mix(finalColor, colorOuter, smoothstep(2.5, 5.0, dist));
      
      // Add "glow" pulses
      finalColor *= 1.0 + 0.2 * sin(uTime + dist);

      gl_FragColor = vec4(finalColor * radialMask, radialMask * uOpacity);
    }
  `
};

export const CelestialBodyShader = {
  uniforms: {
    uTime: { value: 0 },
    uMorph: { value: 0 }, // 0.0: Singularity, 1.0: Sun, 2.0: Earth
  },
  vertexShader: `
    uniform float uTime;
    uniform float uMorph;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      
      // Distortion logic for different states
      if (uMorph < 1.5) {
        // Pulse for Singularity and Sun
        float noise = sin(pos.x * 10.0 + uTime) * cos(pos.y * 10.0 + uTime) * 0.02;
        pos += normal * noise;
      }
      
      vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
      gl_Position = projectionMatrix * vec4(vPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uMorph;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Standard 3D noise
    float hash(float n) { return fract(sin(n) * 43758.5453123); }
    float noise(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                   mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
               mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                   mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    }

    void main() {
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.0);
      
      vec3 finalColor;
      float alpha = 1.0;
      
      // SINGULARITY (uMorph = 0)
      vec3 singularityColor = vec3(0.0, 0.0, 0.0);
      float singularityGlow = fresnel * 0.8;
      
      // SUN (uMorph = 1)
      float sunNoise = noise(vPosition * 2.0 + uTime * 0.4);
      vec3 sunColor = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.7, 0.0), sunNoise);
      sunColor += fresnel * vec3(1.0, 0.9, 0.2);
      
      // EARTH (uMorph = 2)
      float earthNoise = noise(vPosition * 1.5);
      vec3 ocean = vec3(0.05, 0.15, 0.5);
      vec3 land = vec3(0.1, 0.4, 0.1);
      vec3 clouds = vec3(0.9, 0.9, 1.0);
      float cloudMask = smoothstep(0.6, 0.8, noise(vPosition * 3.0 + uTime * 0.05));
      vec3 earthColor = mix(ocean, land, smoothstep(0.45, 0.55, earthNoise));
      earthColor = mix(earthColor, clouds, cloudMask * 0.7);
      earthColor += fresnel * vec3(0.3, 0.6, 1.0) * 0.5; // Atmosphere

      // Interpolate between states
      if (uMorph < 1.0) {
        finalColor = mix(singularityColor + vec3(0.2, 0.1, 0.4) * singularityGlow, sunColor, uMorph);
      } else {
        finalColor = mix(sunColor, earthColor, uMorph - 1.0);
      }
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
