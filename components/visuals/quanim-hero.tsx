"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './quanim-hero.css';

// ─── Scene metadata ───────────────────────────────────────────────────────

/**
 * Interface for Narrative Stages
 * Supports diagnostic flags for the Mechanism stage (heat/aero/fuel)
 */
export interface Scene {
  id: string;
  range: [number, number]; // [start, end] percentage (0.0 - 1.0)
  label: string;
  heading: string[];
  sub: string;
  accent: string;
  heat?: boolean;
  aero?: boolean;
  fuel?: boolean;
}

/**
 * SCENES array with 4 stages:
 * 1. Singularity (0-28)
 * 2. Life (34-55)
 * 3. Mechanism (65-85)
 * 4. Synthesis (95-100)
 */
export const SCENES: Scene[] = [
  {
    id: 'singularity',
    range: [0, 0.28],
    label: 'ASTROPHYSICS',
    heading: ['THE', 'SINGULARITY'],
    sub: 'Where spacetime collapses — and physics meets its own edge.',
    accent: '#ff6b2b',
  },
  {
    id: 'life',
    range: [0.34, 0.55],
    label: 'SCALE OF LIFE',
    heading: ['GRAVITY', 'WRITES THE RULES'],
    sub: 'Orbits. Tides. Weight. One invisible force shaping everything you know.',
    accent: '#4fc3f7',
  },
  {
    id: 'mechanism',
    range: [0.65, 0.85],
    label: 'MECHANISM',
    heading: ['THE PLANE', 'OF REALITY'],
    sub: 'Solving the equations of motion in three dimensions.',
    accent: '#ffb347',
    heat: true,
    aero: true,
    fuel: true,
  },
  {
    id: 'synthesis',
    range: [0.95, 1.0],
    label: 'SYNTHESIS',
    heading: ['BORN FROM', 'STELLAR FIRE'],
    sub: 'Every atom in your body was forged inside a dying star.',
    accent: '#ffffff',
  },
];

/**
 * Smoothstep helper for transitions
 */
const ss = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ─── Shaders ───────────────────────────────────────────────────────────────

const sunVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunFragmentShader = `
  uniform float uTime, uOpa;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

  float sn(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
    for (int i=0;i<6;i++){v+=a*sn(p);p=rot*p*2.1;a*=0.48;}
    return v;
  }

  void main() {
    float t = uTime * 0.05;
    float n  = fbm(vUv * 3.5 + vec2(t, t * 0.7));
    float n2 = fbm(vUv * 7.0 - vec2(t*0.9,-t*0.8) + n*0.4);
    float n3 = fbm(vUv * 14.0 + vec2(-t*0.6,t) + n2*0.3);
    float s  = n*0.5 + n2*0.33 + n3*0.17;

    float limb = pow(max(0.0, dot(normalize(vNormal), vec3(0,0,1))), 0.35);

    vec3 hot  = vec3(1.00,0.98,0.85);
    vec3 warm = vec3(1.00,0.58,0.08);
    vec3 cool = vec3(0.70,0.22,0.02);

    vec3 col = mix(cool, warm, smoothstep(0.3,0.75,s*limb));
    col      = mix(col,  hot,  smoothstep(0.65,1.0,s*limb));
    col     *= 0.65 + limb * 0.5;
    gl_FragColor = vec4(col, uOpa);
  }
`;

// ─── Texture Helpers ───────────────────────────────────────────────────────

/**
 * Ported from quanim.html: Generates a high-fidelity Earth landmass texture using Canvas API.
 */
export const mkEarthTex = (): THREE.CanvasTexture => {
  if (typeof document === 'undefined') {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const W = 1024, H = 512;
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  const ctx = cvs.getContext('2d');
  
  if (!ctx) return new THREE.CanvasTexture(cvs);

  // Background Ocean
  ctx.fillStyle = '#0c2848'; ctx.fillRect(0, 0, W, H);
  
  // Depth Gradient
  const og = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
  og.addColorStop(0, 'rgba(5,80,160,.35)');
  og.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = og; ctx.fillRect(0, 0, W, H);
  
  // Landmasses (Procedural Ellipses)
  ctx.fillStyle = '#1d5e28';
  [
    [160, 150, 100, 90], [195, 230, 58, 88], [440, 138, 64, 58],
    [465, 255, 58, 118], [595, 128, 152, 98], [698, 208, 58, 48], [742, 328, 66, 38]
  ].forEach(([cx, cy, rw, rh]) => {
    ctx.beginPath(); ctx.ellipse(cx, cy, rw/2, rh/2, 0, 0, Math.PI * 2); ctx.fill();
  });
  
  // Polar Ice Caps
  ctx.fillStyle = '#ddeeff'; ctx.globalAlpha = 0.85;
  ctx.fillRect(0, 0, W, 18); ctx.fillRect(0, H - 14, W, 14);
  
  // Night Lights
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffaa'; ctx.globalAlpha = 0.7;
  [
    [160, 150], [195, 230], [440, 138], [465, 255], [595, 128], [698, 208], [742, 328]
  ].forEach(([cx, cy]) => {
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      ctx.arc(cx + (Math.random() - 0.5) * 75, cy + (Math.random() - 0.5) * 55, Math.random() * 1.5 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
};

/**
 * Ported from quanim.html: Generates a lightweight cloud layer texture.
 */
export const mkCloudTex = (): THREE.CanvasTexture => {
  if (typeof document === 'undefined') {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const cvs = document.createElement('canvas'); cvs.width = 512; cvs.height = 256;
  const ctx = cvs.getContext('2d');
  
  if (!ctx) return new THREE.CanvasTexture(cvs);
  
  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  for (let i = 0; i < 48; i++) {
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 512, 
      Math.random() * 256, 
      Math.random() * 55 + 12, 
      Math.random() * 16 + 4, 
      Math.random() * Math.PI, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  }
  
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
};

/**
 * Generates a text texture for 3D labels.
 */
export const mkTextTex = (txt: string, color: string): THREE.CanvasTexture => {
  if (typeof document === 'undefined') {
    return new THREE.Texture() as THREE.CanvasTexture;
  }
  const cvs = document.createElement('canvas');
  cvs.width = 256; cvs.height = 64;
  const ctx = cvs.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(cvs);
  
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = color;
  ctx.font = 'bold 28px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(txt, 128, 42);
  
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  return tex;
};

/**
 * QuanimHero Component
 * Orchestrates the 3D background narrative across scroll stages.
 */
export default function QuanimHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const spRef = useRef(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeIdx, setActiveIdx] = useState(-1);
  const lastIdxRef = useRef(-1);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(1, Math.max(0, scrollY / (height || 1)));
    
    spRef.current = pct;
    setScrollPct(pct);

    let newIdx = -1;
    SCENES.forEach((s, i) => {
      if (pct >= s.range[0] && pct <= s.range[1]) newIdx = i;
    });
    if (newIdx !== lastIdxRef.current) {
      lastIdxRef.current = newIdx;
      setActiveIdx(newIdx);
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.01, 1000);
    camera.position.z = 6.5;

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ── Stars ─────────────────────────────────────────────────────────────
    const SN = 3500;
    const sb = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      sb[i * 3] = (Math.random() - 0.5) * 160;
      sb[i * 3 + 1] = (Math.random() - 0.5) * 160;
      sb[i * 3 + 2] = -35 - Math.random() * 65;
    }
    const starG = new THREE.BufferGeometry();
    starG.setAttribute('position', new THREE.BufferAttribute(sb, 3));
    const starM = new THREE.PointsMaterial({
      size: 0.07, color: 0xffffff, transparent: true, opacity: 0.55,
    });
    scene.add(new THREE.Points(starG, starM));

    // ── BLACK HOLE ────────────────────────────────────────────────────────
    const bhGrp = new THREE.Group();
    scene.add(bhGrp);

    // Event horizon
    bhGrp.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    ));

    // Photon ring — ultra-thin, blindingly bright
    const photonRingM = new THREE.MeshBasicMaterial({
      color: 0xfff0cc, transparent: true, opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const photonRing = new THREE.Mesh(new THREE.RingGeometry(0.975, 1.19, 256), photonRingM);
    photonRing.rotation.x = Math.PI * 0.27;
    bhGrp.add(photonRing);

    // Blue-tinted inner photon sphere (approaching-side doppler)
    const photonRing2M = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const photonRing2 = new THREE.Mesh(new THREE.RingGeometry(0.965, 1.05, 256), photonRing2M);
    photonRing2.rotation.x = Math.PI * 0.27;
    bhGrp.add(photonRing2);

    // Accretion disk — 22,000 particles, Keplerian, doppler colors
    const DN = 22000;
    const dkPos = new Float32Array(DN * 3);
    const dkOrig = new Float32Array(DN * 3);
    const dkSpd = new Float32Array(DN);
    const dkCol = new Float32Array(DN * 3);

    for (let i = 0; i < DN; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.18 + Math.pow(Math.random(), 0.6) * 2.7;
      const h = (Math.random() - 0.5) * 0.07 * Math.max(0.5, r - 1.0);
      dkOrig[i * 3] = Math.cos(a) * r;
      dkOrig[i * 3 + 1] = h;
      dkOrig[i * 3 + 2] = Math.sin(a) * r;
      dkPos[i * 3] = dkOrig[i * 3]; dkPos[i * 3 + 1] = dkOrig[i * 3 + 1]; dkPos[i * 3 + 2] = dkOrig[i * 3 + 2];
      dkSpd[i] = 0.4 + Math.random() * 0.6;

      const rNorm = Math.max(0, (r - 1.18) / 2.7);
      const temp = Math.pow(1 - rNorm, 1.8);
      const approach = (Math.sin(a) + 1) * 0.5;

      dkCol[i * 3] = Math.min(1, temp * 1.1 + 0.15);
      dkCol[i * 3 + 1] = Math.min(1, temp * 0.65 * (0.6 + 0.4 * approach) * 0.8);
      dkCol[i * 3 + 2] = Math.min(1, approach * 0.55 * (1 - temp * 0.6) * 0.35);
    }

    const dkGeom = new THREE.BufferGeometry();
    dkGeom.setAttribute('position', new THREE.BufferAttribute(dkPos, 3));
    dkGeom.setAttribute('color', new THREE.BufferAttribute(dkCol, 3));
    const dkMat = new THREE.PointsMaterial({
      size: 0.015, vertexColors: true, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const dkPts = new THREE.Points(dkGeom, dkMat);
    dkPts.rotation.x = Math.PI * 0.27;
    bhGrp.add(dkPts);

    // Inner ISCO band — smaller, hotter, faster particles
    const HN = 4000;
    const hPos = new Float32Array(HN * 3);
    const hOrig = new Float32Array(HN * 3);
    const hSpd = new Float32Array(HN);
    for (let i = 0; i < HN; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.18 + Math.pow(Math.random(), 2.5) * 0.55;
      const h = (Math.random() - 0.5) * 0.04;
      hOrig[i * 3] = Math.cos(a) * r; hOrig[i * 3 + 1] = h; hOrig[i * 3 + 2] = Math.sin(a) * r;
      hPos[i * 3] = hOrig[i * 3]; hPos[i * 3 + 1] = hOrig[i * 3 + 1]; hPos[i * 3 + 2] = hOrig[i * 3 + 2];
      hSpd[i] = 0.7 + Math.random() * 0.5;
    }
    const hGeom = new THREE.BufferGeometry();
    hGeom.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    const hMat = new THREE.PointsMaterial({
      size: 0.026, color: 0xfff4e0, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const hPts = new THREE.Points(hGeom, hMat);
    hPts.rotation.x = Math.PI * 0.27;
    bhGrp.add(hPts);

    // Gravitational glow (two layers)
    const glowM = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 32), glowM));

    const glow2M = new THREE.MeshBasicMaterial({
      color: 0xff2200, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 32), glow2M));

    // ── EARTH ─────────────────────────────────────────────────────────────
    const eGrp = new THREE.Group();
    scene.add(eGrp);

    const eMat = new THREE.MeshPhongMaterial({
      map: mkEarthTex(), transparent: true, opacity: 0,
      specular: new THREE.Color(0.2, 0.45, 0.9), shininess: 18,
    });
    const eMesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), eMat);
    eGrp.add(eMesh);

    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x1166ff, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    eGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.48, 32, 32), atmMat));

    const clMat = new THREE.MeshBasicMaterial({
      map: mkCloudTex(), transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const clMesh = new THREE.Mesh(new THREE.SphereGeometry(1.39, 32, 32), clMat);
    clMesh.rotation.y = 0.4; eGrp.add(clMesh);

    // ── PLANE (MECHANISM) ───────────────────────────────────────────────────
    const pGrp = new THREE.Group();
    scene.add(pGrp);
    pGrp.visible = false;

    const pMat = new THREE.MeshPhongMaterial({
      color: 0xcccccc, transparent: true, opacity: 0,
      specular: 0xffffff, shininess: 30,
      emissive: new THREE.Color(0x000000)
    });

    // Fuselage - oriented along X for sideways view
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 1.6, 8), pMat);
    fuse.rotation.z = Math.PI / 2;
    pGrp.add(fuse);

    // Wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 1.8), pMat);
    wings.position.x = 0.1;
    pGrp.add(wings);

    // Tail
    const tailH = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.7), pMat);
    tailH.position.x = -0.65;
    pGrp.add(tailH);
    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.03), pMat);
    tailV.position.x = -0.65; tailV.position.y = 0.15;
    pGrp.add(tailV);

    // Aero Lines
    const aeroLines: THREE.Line[] = [];
    for (let i = 0; i < 12; i++) {
      const ly = (Math.random() - 0.5) * 0.4;
      const lz = (Math.random() - 0.5) * 1.8;
      const points = [new THREE.Vector3(0.8, ly, lz), new THREE.Vector3(-0.8, ly, lz)];
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points), 
        new THREE.LineBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0 })
      );
      pGrp.add(line);
      aeroLines.push(line);
    }

    // Fuel Label
    const fuelMat = new THREE.SpriteMaterial({ 
      map: mkTextTex("FUEL: NOMINAL", "#ffb347"), transparent: true, opacity: 0 
    });
    const fuelSprite = new THREE.Sprite(fuelMat);
    fuelSprite.scale.set(1.0, 0.25, 1);
    fuelSprite.position.set(0.2, 0.4, 0);
    pGrp.add(fuelSprite);

    // ── SUN ───────────────────────────────────────────────────────────────
    const sGrp = new THREE.Group();
    scene.add(sGrp);

    const sunMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpa: { value: 0 } },
      transparent: true,
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
    });
    sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 64), sunMat));

    const coronaDefs = [
      { r: 2.25, col: 0xff8c00, max: 0.14 },
      { r: 2.75, col: 0xff5500, max: 0.08 },
      { r: 3.5,  col: 0xff2200, max: 0.04 },
      { r: 5.0,  col: 0xff1100, max: 0.02 },
    ];
    const coronaMats = coronaDefs.map(({ r, col, max }) => {
      const m = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      });
      (m as any)._max = max;
      sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m));
      return m;
    });

    const flareDefs = [
      { dir: [0.8, 0.5, 0],     sc: [0.08, 0.55, 0.08], col: 0xff7700 },
      { dir: [-0.4, 0.9, 0.3],  sc: [0.07, 0.42, 0.07], col: 0xff4400 },
      { dir: [0.2, -0.85, 0.5], sc: [0.06, 0.38, 0.06], col: 0xff8800 },
    ];
    const flareMats = flareDefs.map(({ dir, sc, col }) => {
      const m = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), m);
      mesh.scale.set(sc[0], sc[1], sc[2]);
      const dx = dir[0], dy = dir[1], dz = dir[2];
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
      mesh.position.set(dx/len * 2.1, dy/len * 2.1, dz/len * 2.1);
      mesh.lookAt(0, 0, 0);
      sGrp.add(mesh);
      return m;
    });

    const dLight = new THREE.DirectionalLight(0xffffff, 1.9);
    dLight.position.set(4, 1, 3); scene.add(dLight);
    scene.add(new THREE.AmbientLight(0x102040, 0.75));

    // ── Flash DOM overlay ─────────────────────────────────────────────────
    const flashEl = document.createElement('div');
    Object.assign(flashEl.style, {
      position: 'fixed', inset: '0', background: '#fff',
      opacity: '0', pointerEvents: 'none', zIndex: '8',
    });
    document.body.appendChild(flashEl);

    // ── Render loop ───────────────────────────────────────────────────────
    let raf: number;
    let prevNow = 0;
    let dkRot = 0;
    let sunClock = 0;

    function animate(now: number) {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - prevNow) * 0.001);
      prevNow = now;
      const s = spRef.current;

      // — Stars fade —
      // Fade out for BH, fade back in after flash
      const starFade = ss(0.18, 0.28, s) * (1 - ss(0.32, 0.42, s));
      starM.opacity = 0.55 * (1 - starFade * 0.94);

      // — Black Hole —
      const bhA = ss(0, 0.04, s) * (1 - ss(0.22, 0.32, s));
      photonRingM.opacity = bhA * 1.0;
      photonRing2M.opacity = bhA * 0.6;
      dkMat.opacity = bhA * 1.0;
      hMat.opacity = bhA * 0.85;
      glowM.opacity = bhA * 0.08;
      glow2M.opacity = bhA * 0.03;

      if (bhA > 0.002) {
        dkRot += dt * 0.38;
        const pa = dkGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < DN; i++) {
          const ox = dkOrig[i * 3], oz = dkOrig[i * 3 + 2];
          const r = Math.sqrt(ox * ox + oz * oz);
          const ang = Math.atan2(oz, ox) + dkRot * dkSpd[i] * (1.4 / Math.max(0.6, Math.pow(r, 1.2)));
          pa[i * 3] = Math.cos(ang) * r;
          pa[i * 3 + 2] = Math.sin(ang) * r;
        }
        dkGeom.attributes.position.needsUpdate = true;

        const hp = hGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < HN; i++) {
          const ox = hOrig[i * 3], oz = hOrig[i * 3 + 2];
          const r = Math.sqrt(ox * ox + oz * oz);
          const ang = Math.atan2(oz, ox) + dkRot * hSpd[i] * (2.0 / Math.max(0.5, r));
          hp[i * 3] = Math.cos(ang) * r;
          hp[i * 3 + 2] = Math.sin(ang) * r;
        }
        hGeom.attributes.position.needsUpdate = true;
      }
      bhGrp.scale.setScalar(1 + ss(0.13, 0.28, s) * 0.6);

      // — Flash Transition (28-34%) —
      const flash = ss(0.19, 0.26, s) * (1 - ss(0.26, 0.34, s));
      flashEl.style.opacity = String(flash);

      // — Earth Visuals (34-55%, and 85-95% orbit) —
      const eA = (ss(0.28, 0.43, s) * (1 - ss(0.74, 0.84, s))) + ss(0.85, 0.95, s);
      eMat.opacity = eA;
      atmMat.opacity = eA * 0.18;
      clMat.opacity = eA * 0.2;

      if (eA > 0.002) {
        eMesh.rotation.y += dt * 0.10;
        clMesh.rotation.y += dt * 0.065;
        
        // Scale and Color Lerps driven by scroll
        const sunFactor = 1 - ss(0.28, 0.47, s);
        eGrp.scale.setScalar(1 + sunFactor * 2.9);
        
        // Apply color lerp from orange/sun to blue/earth
        eMat.color.set(new THREE.Color().lerpColors(
          new THREE.Color(0.11, 0.3, 0.64), new THREE.Color(1, 0.37, 0), sunFactor
        ));
        
        // Atmosphere color shift
        atmMat.color.set(new THREE.Color(0.06 + sunFactor * 0.7, 0.5 - sunFactor * 0.3, 1 - sunFactor * 0.9));
        
        // Position: Centered until 50%, then moves right. 
        // For Sun sequence, move it further out to avoid overlap.
        const orbitAmt = ss(0.85, 0.95, s);
        eGrp.position.x = ss(0.50, 0.65, s) * 2.7 + orbitAmt * 5.0;
      }

      // — Mechanism / Plane Stage (65-85%) —
      const pA = ss(0.58, 0.68, s) * (1 - ss(0.85, 0.95, s));
      pGrp.visible = pA > 0.001;
      pMat.opacity = pA;
      
      // ── Camera Orchestration ──
      if (s < 0.85) {
        const focusAmt = ss(0.55, 0.70, s);
        camera.position.z = 6.5 - focusAmt * 3.8;
        camera.position.x = focusAmt * 1.8;
        camera.lookAt(focusAmt * 1.8, 0, 0);
      } else if (s < 0.95) {
        // Transition: Zoom out from Plane, show Earth orbit
        const transAmt = ss(0.85, 0.95, s);
        camera.position.z = 2.7 + transAmt * 10.0; // zoom out to 12.7
        camera.position.x = 1.8 + transAmt * 5.9; // move to 7.7
        camera.lookAt(1.8 + transAmt * 5.9, 0, 0); // look at 7.7
      } else {
        // Sun Fixation: Pan away from Earth to centered Sun
        const sunFixAmt = ss(0.95, 1.0, s);
        camera.position.z = 12.7 - sunFixAmt * 6.2; // pan in to 6.5
        camera.position.x = 7.7 * (1 - sunFixAmt); // move to 0
        camera.lookAt(7.7 * (1 - sunFixAmt), 0, 0); // look to center
      }
      
      pGrp.position.x = 1.8; // Stay in camera focus
      
      if (pA > 0.001) {
        // Heat Overlay (65-72%) - Sequenced first
        const heatA = ss(0.65, 0.72, s) * (1 - ss(0.72, 0.75, s));
        const heatCol = new THREE.Color(0xcccccc).lerp(new THREE.Color(0xff4400), heatA);
        pMat.color.copy(heatCol);
        pMat.emissive.copy(heatCol).multiplyScalar(heatA * 0.45);
        
        // Fuel Overlay (72-79%) - Sequenced second
        const fuelA = ss(0.72, 0.79, s) * (1 - ss(0.79, 0.82, s));
        fuelMat.opacity = fuelA;
        const fPulse = 1.0 + Math.sin(now * 0.01) * 0.08 * fuelA;
        fuelSprite.scale.set(1.0 * fPulse, 0.25 * fPulse, 1);
        
        // Aero Overlay (79-85%) - Sequenced third
        const aeroA = ss(0.79, 0.85, s);
        aeroLines.forEach((l, i) => {
          (l.material as THREE.LineBasicMaterial).opacity = aeroA * 0.6;
          // Flow effect along X axis
          l.position.x = ((now * 0.002 + i * 0.3) % 2) - 1;
        });
      }

      // — Sun Visuals (95-100%) —
      const sunA = ss(0.92, 0.98, s);
      (sunMat.uniforms.uOpa as any).value = sunA;
      if (sunA > 0.001) {
        sunClock += dt;
        (sunMat.uniforms.uTime as any).value = sunClock;
        sGrp.rotation.y += dt * 0.15;
        
        coronaMats.forEach(m => { m.opacity = sunA * (m as any)._max; });
        flareMats.forEach((m, i) => {
          const pulse = 0.6 + 0.4 * Math.sin(now * 0.001 * (0.7 + i * 0.3));
          m.opacity = sunA * 0.45 * pulse;
        });
      }

      renderer.render(scene, camera);
    }

    animate(0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);

      // Recursive disposal of all Three.js resources
      scene.traverse((object: any) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat: any) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });

      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      if (flashEl.parentNode) flashEl.remove();
    };
  }, [handleScroll]);

  const sceneData = activeIdx >= 0 ? SCENES[activeIdx] : null;
  const pctLabel = String(Math.round(scrollPct * 100)).padStart(3, '0') + '%';
  const textIn = sceneData !== null &&
    scrollPct >= sceneData.range[0] + 0.05 &&
    scrollPct <= sceneData.range[1] - 0.05;

  const stageLabel = scrollPct < 0.28 ? 'THE SINGULARITY'
    : scrollPct < 0.34 ? 'WARP TRANSITION'
    : scrollPct < 0.55 ? 'SCALE OF LIFE'
    : scrollPct < 0.85 ? 'MECHANISM'
    : scrollPct < 0.95 ? 'SYNTHESIS TRANSITION'
    : 'SYNTHESIS';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Three.js canvas mount point */}
      <div ref={mountRef} className="qh-canvas-wrap" />

      {/* Film grain effect */}
      <div className="qh-grain" />
    </div>
  );
}
