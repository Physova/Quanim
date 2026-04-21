"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import './physova-hero.css';

/* ── Smoothstep ─────────────────────────────────────────────────── */
const ss = (e0: number, e1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ── Sun Shaders ────────────────────────────────────────────────── */
const SUN_VERT = `
  varying vec2 vUv; varying vec3 vNorm;
  void main(){
    vUv=uv; vNorm=normalize(normalMatrix*normal);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }`;

const SUN_FRAG = `
  uniform float uTime,uOpa; varying vec2 vUv; varying vec3 vNorm;
  float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float sn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.0,a=0.5;mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
    for(int i=0;i<6;i++){v+=a*sn(p);p=rot*p*2.1;a*=0.48;}return v;}
  void main(){
    float t=uTime*0.038;
    float n=fbm(vUv*4.0+vec2(t,t*0.7));
    float n2=fbm(vUv*8.0-vec2(t*0.8,-t*0.9)+n*0.45);
    float n3=fbm(vUv*16.0+vec2(-t*0.6,t*1.1)+n2*0.35);
    float gran=fbm(vUv*40.0+vec2(t*2.0,-t*1.5))*0.075;
    float s=n*0.44+n2*0.34+n3*0.19+gran;
    float sp1=smoothstep(0.13,0.0,length((vUv-vec2(0.32+sin(uTime*0.007)*0.04,0.52))*vec2(1.3,1.0)));
    float sp2=smoothstep(0.09,0.0,length((vUv-vec2(0.62+cos(uTime*0.005)*0.04,0.44))*vec2(1.0,1.2)));
    float sp3=smoothstep(0.06,0.0,length((vUv-vec2(0.50+sin(uTime*0.009+1.0)*0.03,0.58))*vec2(1.1,1.0)));
    float spots=max(sp1,max(sp2,sp3));
    float limb=pow(max(0.0,dot(normalize(vNorm),vec3(0,0,1))),0.26);
    vec3 hotW=vec3(1.0,0.98,0.88),warm=vec3(1.0,0.62,0.08),orng=vec3(0.95,0.40,0.02),cool=vec3(0.72,0.20,0.02);
    vec3 col=mix(cool,orng,smoothstep(0.18,0.58,s*limb));
    col=mix(col,warm,smoothstep(0.52,0.82,s*limb));
    col=mix(col,hotW,smoothstep(0.78,1.0,s*limb));
    vec3 umbra=mix(col,vec3(0.15,0.04,0.005),sp1*0.95+sp2*0.95+sp3*0.9);
    vec3 penumbra=mix(col,vec3(0.50,0.18,0.02),spots*0.6);
    col=mix(col,umbra,0.7); col=mix(col,penumbra,spots*0.35);
    col*=0.60+limb*0.54;
    gl_FragColor=vec4(col,uOpa);
  }`;

const CHROMO_VERT = `varying vec3 vNorm;void main(){vNorm=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const CHROMO_FRAG = `uniform float uOpa;varying vec3 vNorm;void main(){float f=1.0-abs(dot(vNorm,vec3(0,0,1)));float ch=pow(f,1.6);vec3 col=mix(vec3(1.0,0.55,0.06),vec3(1.0,0.18,0.01),ch);gl_FragColor=vec4(col,ch*0.52*uOpa);}`;

/* ── Texture Helpers ────────────────────────────────────────────── */
function mkEarthTex(): THREE.CanvasTexture {
  const W = 1024, H = 512, c = document.createElement('canvas');
  c.width = W; c.height = H; const x = c.getContext('2d')!;
  x.fillStyle = '#0a2d5c'; x.fillRect(0, 0, W, H);
  const og = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  og.addColorStop(0, 'rgba(10,90,180,.3)'); og.addColorStop(1, 'rgba(0,0,0,.55)');
  x.fillStyle = og; x.fillRect(0, 0, W, H);
  x.fillStyle = '#1a6b2a';
  ([[160,150,100,90],[195,230,58,88],[440,138,64,58],[465,255,58,118],[595,128,152,98],[698,208,58,48],[742,328,66,38]] as number[][]).forEach(([cx,cy,rw,rh]) => { x.beginPath(); x.ellipse(cx,cy,rw/2,rh/2,0,0,Math.PI*2); x.fill(); });
  x.fillStyle = '#145520';
  ([[165,155,70,60],[200,235,38,60],[445,142,44,38],[600,132,120,70]] as number[][]).forEach(([cx,cy,rw,rh]) => { x.beginPath(); x.ellipse(cx,cy,rw/2,rh/2,0,0,Math.PI*2); x.fill(); });
  x.fillStyle = '#ddeeff'; x.globalAlpha = 0.8;
  x.fillRect(0, 0, W, 16); x.fillRect(0, H - 13, W, 13); x.globalAlpha = 1;
  x.fillStyle = '#ffffaa'; x.globalAlpha = 0.65;
  ([[160,150],[195,230],[440,138],[595,128],[698,208],[742,328]] as number[][]).forEach(([cx,cy]) => {
    for (let i = 0; i < 22; i++) { x.beginPath(); x.arc(cx + (Math.random() - 0.5) * 72, cy + (Math.random() - 0.5) * 50, Math.random() * 1.4 + 0.5, 0, Math.PI * 2); x.fill(); }
  });
  x.globalAlpha = 1;
  return new THREE.CanvasTexture(c);
}

function mkCloudTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d')!; x.clearRect(0, 0, 512, 256);
  x.fillStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 40; i++) { x.beginPath(); x.ellipse(Math.random() * 512, Math.random() * 256, Math.random() * 50 + 14, Math.random() * 14 + 5, Math.random() * Math.PI, 0, Math.PI * 2); x.fill(); }
  return new THREE.CanvasTexture(c);
}

function mkFlareTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(0.15, 'rgba(255,220,140,0.8)');
  g.addColorStop(0.4, 'rgba(255,180,60,0.3)'); g.addColorStop(1, 'rgba(255,120,20,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ── Wing Geometry ──────────────────────────────────────────────── */
function mkWingGeo(span: number, chord: number, taper: number): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry(); const hw = span / 2;
  const v = new Float32Array([chord*0.3,0.012,0,chord*0.3,0.012,hw,-chord*0.7,0.012,0,-chord*taper,0.012,hw,chord*0.3,-0.012,0,chord*0.3,-0.012,hw,-chord*0.7,-0.012,0,-chord*taper,-0.012,hw]);
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.setIndex([0,2,1,1,2,3,4,5,6,5,7,6,0,1,5,0,5,4,2,6,3,3,6,7,0,4,6,0,6,2,1,3,7,1,7,5]);
  geo.computeVertexNormals(); return geo;
}

/* ── DOM Label Helpers ──────────────────────────────────────────── */
function mkLabel(parent: HTMLElement, lc: string, title: string, value: string, note: string): HTMLDivElement {
  const el = document.createElement('div'); el.className = 'plbl';
  el.style.setProperty('--lc', lc);
  el.innerHTML = `<span class="lt">${title}</span><span class="lv">${value}</span><span class="ln">${note}</span>`;
  parent.appendChild(el); return el;
}
function mkSvgLine(svg: SVGSVGElement): SVGLineElement {
  const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  ln.setAttribute('stroke-width', '1'); ln.setAttribute('fill', 'none');
  svg.appendChild(ln); return ln;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function PhysovaHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const spRef = useRef(0);

  const handleScroll = useCallback(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    spRef.current = Math.min(1, window.scrollY / max);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Responsive helpers ──────────────────────────────────────── */
    const isMobileQuery = () => window.innerWidth < 768;
    let isMobile = isMobileQuery();

    /* ── Renderer ────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.01, 2000);
    camera.position.z = 6.5;

    const onResize = () => {
      isMobile = isMobileQuery();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    /* ── Stars ───────────────────────────────────────────────────── */
    const SN = isMobile ? 2000 : 4200;
    const sb = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) { sb[i*3] = (Math.random()-0.5)*220; sb[i*3+1] = (Math.random()-0.5)*220; sb[i*3+2] = -30 - Math.random()*80; }
    const starG = new THREE.BufferGeometry();
    starG.setAttribute('position', new THREE.BufferAttribute(sb, 3));
    const starM = new THREE.PointsMaterial({ size: 0.07, color: 0xffffff, transparent: true, opacity: 0.55 });
    scene.add(new THREE.Points(starG, starM));

    /* ── BLACK HOLE ──────────────────────────────────────────────── */
    const bhGrp = new THREE.Group(); scene.add(bhGrp);
    const bhSphereMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), bhSphereMat));
    const photonRM = new THREE.MeshBasicMaterial({ color: 0xfff0cc, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const photonR = new THREE.Mesh(new THREE.RingGeometry(0.975, 1.19, 256), photonRM); photonR.rotation.x = Math.PI * 0.27; bhGrp.add(photonR);
    const photonR2M = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const photonR2 = new THREE.Mesh(new THREE.RingGeometry(0.965, 1.05, 256), photonR2M); photonR2.rotation.x = Math.PI * 0.27; bhGrp.add(photonR2);

    // Accretion disk
    const DN = 2500;
    const dkPos = new Float32Array(DN * 3), dkOrig = new Float32Array(DN * 3), dkSpd = new Float32Array(DN), dkCol = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.18 + Math.pow(Math.random(), 0.6) * 2.7;
      const h = (Math.random() - 0.5) * 0.12 * Math.max(0.5, r - 1);
      dkOrig[i*3] = Math.cos(a)*r; dkOrig[i*3+1] = h; dkOrig[i*3+2] = Math.sin(a)*r;
      dkPos[i*3] = dkOrig[i*3]; dkPos[i*3+1] = dkOrig[i*3+1]; dkPos[i*3+2] = dkOrig[i*3+2];
      dkSpd[i] = 0.4 + Math.random() * 0.6;
      const rN = Math.max(0, (r - 1.18) / 2.7), temp = Math.pow(1 - rN, 1.8), ap = (Math.sin(a) + 1) * 0.5;
      dkCol[i*3] = Math.min(1, temp * 1.1 + 0.15); dkCol[i*3+1] = Math.min(1, temp * 0.65 * (0.6 + 0.4 * ap) * 0.8); dkCol[i*3+2] = Math.min(1, ap * 0.55 * (1 - temp * 0.6) * 0.35);
    }
    const dkGeom = new THREE.BufferGeometry();
    dkGeom.setAttribute('position', new THREE.BufferAttribute(dkPos, 3));
    dkGeom.setAttribute('color', new THREE.BufferAttribute(dkCol, 3));
    const dkMat = new THREE.PointsMaterial({ size: 0.038, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const dkPts = new THREE.Points(dkGeom, dkMat); dkPts.rotation.x = Math.PI * 0.27; bhGrp.add(dkPts);

    // Inner ISCO band
    const HN = isMobile ? 1500 : 3000;
    const hPos = new Float32Array(HN * 3), hOrig = new Float32Array(HN * 3), hSpd = new Float32Array(HN);
    for (let i = 0; i < HN; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.18 + Math.pow(Math.random(), 2.5) * 0.55, h = (Math.random() - 0.5) * 0.04;
      hOrig[i*3] = Math.cos(a)*r; hOrig[i*3+1] = h; hOrig[i*3+2] = Math.sin(a)*r;
      hPos[i*3] = hOrig[i*3]; hPos[i*3+1] = hOrig[i*3+1]; hPos[i*3+2] = hOrig[i*3+2];
      hSpd[i] = 0.7 + Math.random() * 0.5;
    }
    const hGeom = new THREE.BufferGeometry(); hGeom.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    const hMat = new THREE.PointsMaterial({ size: 0.026, color: 0xfff4e0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const hPts = new THREE.Points(hGeom, hMat); hPts.rotation.x = Math.PI * 0.27; bhGrp.add(hPts);

    // Glow
    const glowM = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 32), glowM));
    const glow2M = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 32), glow2M));

    /* ── TRANSITION FLARE ────────────────────────────────────────── */
    const flareSprMat = new THREE.SpriteMaterial({ map: mkFlareTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const flareSpr = new THREE.Sprite(flareSprMat); flareSpr.scale.set(0.01, 0.01, 1); scene.add(flareSpr);

    /* ── EARTH ───────────────────────────────────────────────────── */
    const eGrp = new THREE.Group(); scene.add(eGrp);
    const earthTex = mkEarthTex();
    const eMat = new THREE.MeshPhongMaterial({ map: earthTex, transparent: true, opacity: 0, specular: new THREE.Color(0.2, 0.45, 0.9), shininess: 14 });
    const eMesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), eMat); eGrp.add(eMesh);
    const atmMat = new THREE.MeshBasicMaterial({ color: 0x1166ff, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
    eGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.46, 32, 32), atmMat));
    const clMat = new THREE.MeshBasicMaterial({ map: mkCloudTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const clMesh = new THREE.Mesh(new THREE.SphereGeometry(1.38, 32, 32), clMat); clMesh.rotation.y = 0.4; eGrp.add(clMesh);

    /* ── Lights ──────────────────────────────────────────────────── */
    const dL = new THREE.DirectionalLight(0xffffff, 1.9); dL.position.set(4, 1, 3); scene.add(dL);
    scene.add(new THREE.AmbientLight(0x102040, 0.75));

    /* ── TINY SPACECRAFT ─────────────────────────────────────────── */
    const tinyShipGrp = new THREE.Group(); scene.add(tinyShipGrp);
    const tinyShipMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0 });
    const tinyBody = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.06, 8), tinyShipMat); tinyBody.rotation.z = Math.PI / 2; tinyShipGrp.add(tinyBody);
    const tinyNose = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.02, 8), tinyShipMat); tinyNose.rotation.z = -Math.PI / 2; tinyNose.position.x = 0.04; tinyShipGrp.add(tinyNose);
    tinyShipGrp.position.set(1.0, 0.8, 0.5);

    /* ── SPACESHIP ───────────────────────────────────────────────── */
    const planeGrp = new THREE.Group(); scene.add(planeGrp);
    planeGrp.scale.setScalar(isMobile ? 1.2 : 1.8);
    const mkSolid = (col: number, spec = 0x6688aa, shin = 70) => new THREE.MeshPhongMaterial({ color: col, specular: spec, shininess: shin, transparent: true, opacity: 0, depthWrite: true, side: THREE.FrontSide });
    const mBod = mkSolid(0xdddddd, 0xffffff, 50), mMet = mkSolid(0xaaaaaa, 0x8899aa, 90), mDrk = mkSolid(0x222222, 0x111111, 20), mGls = mkSolid(0x08121e, 0xffffff, 210);
    const addM = (geo: THREE.BufferGeometry, mat: THREE.Material, px=0,py=0,pz=0,rx=0,ry=0,rz=0) => { const m = new THREE.Mesh(geo, mat); m.position.set(px,py,pz); m.rotation.set(rx,ry,rz); planeGrp.add(m); return m; };

    // Fuselage (lathe)
    const fProf: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const t = i/24; let r: number; if (t < 0.15) r = 0.01 + Math.sin(t/0.15*Math.PI*0.5)*0.11; else if (t < 0.85) r = 0.12; else r = 0.12*(1-(t-0.85)/0.15*0.3); fProf.push(new THREE.Vector2(r, t*3.0-1.5)); }
    addM(new THREE.LatheGeometry(fProf, 24), mBod, 0,0,0, 0,0,Math.PI/2);
    addM(new THREE.SphereGeometry(0.015, 12, 12), mMet, 1.55, 0, 0);

    // Wings
    const wR = new THREE.Mesh(mkWingGeo(0.7, 1.4, 0.15), mMet); wR.position.set(-0.2, 0, 0); planeGrp.add(wR);
    const wLg = mkWingGeo(0.7, 1.4, 0.15); wLg.scale(-1, 1, -1); wLg.computeVertexNormals();
    const wL = new THREE.Mesh(wLg, mMet); wL.position.set(-0.2, 0, 0); planeGrp.add(wL);

    // Stabilizers + Cockpit
    addM(new THREE.BoxGeometry(0.22, 0.18, 0.015), mMet, -0.55, 0.09, 0.34);
    addM(new THREE.BoxGeometry(0.22, 0.18, 0.015), mMet, -0.55, 0.09, -0.34);
    addM(new THREE.BoxGeometry(0.5, 0.32, 0.015), mMet, -1.1, 0.18, 0);
    addM(new THREE.BoxGeometry(0.35, 0.05, 0.12), mGls, 0.85, 0.075, 0, 0, 0, -0.08);

    // Thrusters
    const mkThruster = (px: number, py: number, pz: number) => {
      const g = new THREE.Group(); g.position.set(px, py, pz);
      const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.28, 14), mMet); tb.rotation.set(0, 0, Math.PI / 2); g.add(tb);
      const er = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.007, 8, 20), mDrk); er.rotation.y = Math.PI / 2; er.position.x = -0.14; g.add(er);
      planeGrp.add(g);
    };
    mkThruster(-1.5, 0, 0); mkThruster(-1.45, -0.07, 0.10); mkThruster(-1.45, -0.07, -0.10);

    // Collect all plane materials
    const planeMats: THREE.Material[] = [];
    planeGrp.traverse((c: THREE.Object3D) => { if ((c as THREE.Mesh).isMesh && (c as THREE.Mesh).material) planeMats.push((c as THREE.Mesh).material as THREE.Material); });

    // Exhaust particles
    const HEAT_N = isMobile ? 200 : 450;
    const hxBuf = new Float32Array(HEAT_N * 3), hxLife = new Float32Array(HEAT_N), hxCol = new Float32Array(HEAT_N * 3);
    for (let i = 0; i < HEAT_N; i++) { hxLife[i] = Math.random(); const t2 = Math.random(); hxCol[i*3] = 1; hxCol[i*3+1] = t2*0.4; hxCol[i*3+2] = 0; }
    const hxG = new THREE.BufferGeometry(); hxG.setAttribute('position', new THREE.BufferAttribute(hxBuf, 3)); hxG.setAttribute('color', new THREE.BufferAttribute(hxCol, 3));
    const hxM = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    planeGrp.add(new THREE.Points(hxG, hxM));

    /* ── SUN ──────────────────────────────────────────────────────── */
    const sGrp = new THREE.Group(); scene.add(sGrp);
    const sunMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOpa: { value: 0 } }, transparent: true, vertexShader: SUN_VERT, fragmentShader: SUN_FRAG });
    sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(2.0, 64, 64), sunMat));
    const chromoMat = new THREE.ShaderMaterial({ uniforms: { uOpa: { value: 0 } }, transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false, vertexShader: CHROMO_VERT, fragmentShader: CHROMO_FRAG });
    sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(2.14, 32, 32), chromoMat));

    // Corona — 7 layers
    const coronaDefs = [{r:2.5,col:0xff8800,max:0.18},{r:3.3,col:0xff5500,max:0.11},{r:4.4,col:0xff2200,max:0.055},{r:5.8,col:0xff1100,max:0.035},{r:7.5,col:0xdd0800,max:0.02},{r:10,col:0xcc0600,max:0.012},{r:13,col:0xaa0400,max:0.006}];
    const coronaMats = coronaDefs.map(({ r, col, max }) => {
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false });
      (m as THREE.MeshBasicMaterial & { _max: number })._max = max;
      sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m));
      return m;
    });

    // Prominences — 4 cubic bezier curves
    const promPts = [[2,0,0.1],[3.1,1.5,0.2],[3.2,2.5,-0.1],[1.9,1.2,0.2],[-1.8,0.9,0.3],[-3,2.2,0.5],[-3.2,3,0.2],[-2.3,1,-0.2],[0.5,2,0.1],[1.3,3.2,0.4],[-0.5,3.5,0.5],[-1,2,0.1],[1.6,-0.5,0.5],[2.5,-1.8,0.3],[2.8,-2.8,-0.1],[1.4,-1,0.4]];
    const promLineMats: THREE.LineBasicMaterial[] = [];
    const promColors = [0xff6600, 0xff4400, 0xff7700, 0xff6600];
    for (let i = 0; i < 4; i++) {
      const pts = promPts.slice(i*4,(i+1)*4).map(p => new THREE.Vector3(p[0],p[1],p[2]));
      const curve = new THREE.CubicBezierCurve3(pts[0],pts[1],pts[2],pts[3]);
      const m = new THREE.LineBasicMaterial({ color: promColors[i], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      sGrp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), m));
      promLineMats.push(m);
    }

    // Solar flares
    const sunFlareDefs = [{dir:[0.8,0.5,0],sc:[0.08,0.55,0.08] as [number,number,number],col:0xff7700},{dir:[-0.4,0.9,0.3],sc:[0.07,0.42,0.07] as [number,number,number],col:0xff4400},{dir:[0.2,-0.85,0.5],sc:[0.06,0.38,0.06] as [number,number,number],col:0xff8800},{dir:[0.9,-0.3,-0.2],sc:[0.06,0.32,0.06] as [number,number,number],col:0xff5500}];
    const sunFlareMats = sunFlareDefs.map(({ dir, sc, col }) => {
      const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), m); mesh.scale.set(sc[0], sc[1], sc[2]);
      const L = Math.hypot(dir[0], dir[1], dir[2]); mesh.position.set(dir[0]/L*2.4, dir[1]/L*2.4, dir[2]/L*2.4);
      sGrp.add(mesh); return m;
    });

    // Orbiting planets
    const planetDefs = [{radius:3.8,size:0.06,color:0x888888,speed:1.6,incl:0.03,isEarth:false},{radius:5.2,size:0.09,color:0xddaa55,speed:1.1,incl:-0.05,isEarth:false},{radius:7.0,size:0.10,color:0x2266aa,speed:0.7,incl:0.04,isEarth:true},{radius:9.0,size:0.08,color:0xcc5533,speed:0.5,incl:0.08,isEarth:false}];
    const planets = planetDefs.map(({ radius, size, color, speed, incl, isEarth }) => {
      const mat = isEarth ? new THREE.MeshBasicMaterial({ map: earthTex, transparent: true, opacity: 0 }) : new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, isEarth ? 32 : 12, isEarth ? 32 : 12), mat); sGrp.add(mesh);
      const oMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0, depthWrite: false });
      const oPts: THREE.Vector3[] = []; for (let a = 0; a <= 64; a++) { const ang = a/64*Math.PI*2; oPts.push(new THREE.Vector3(Math.cos(ang)*radius, 0, Math.sin(ang)*radius)); }
      const oLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(oPts), oMat); oLine.rotation.x = Math.PI * 0.42 + incl; sGrp.add(oLine);
      return { mesh, mat, oMat, radius, speed, incl };
    });

    /* ── DOM: Flash + Labels ─────────────────────────────────────── */
    const flashEl = document.createElement('div'); flashEl.className = 'qh-flash'; document.body.appendChild(flashEl);
    const labelRoot = document.createElement('div'); labelRoot.className = 'qh-label-root'; document.body.appendChild(labelRoot);
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svgEl.setAttribute('class', 'qh-label-svg'); svgEl.setAttribute('width', '100%'); svgEl.setAttribute('height', '100%'); document.body.appendChild(svgEl);

    const lnHeat = mkSvgLine(svgEl), lnFuel = mkSvgLine(svgEl), lnAero = mkSvgLine(svgEl);
    const lnCore = mkSvgLine(svgEl), lnSurf = mkSvgLine(svgEl), lnLum = mkSvgLine(svgEl);
    const lblHeat = mkLabel(labelRoot, 'rgba(255,155,55,.95)', 'Heat Transmission', '1,850 °C', 'leading edge surface temp');
    const lblFuel = mkLabel(labelRoot, 'rgba(100,235,165,.95)', 'Thrust Output', '160 kN', 'rocket acceleration phase');
    const lblAero = mkLabel(labelRoot, 'rgba(80,185,255,.95)', 'Aerodynamics', 'Cd 0.027', 'drag coeff · hypersonic');
    const lblCore = mkLabel(labelRoot, 'rgba(255,220,100,.95)', 'Core Temperature', '15.7 MK', '1.57 × 10⁷ kelvin · fusion zone');
    const lblSurf = mkLabel(labelRoot, 'rgba(255,155,55,.95)', 'Surface Temperature', '5,778 K', 'photosphere · effective blackbody');
    const lblLum  = mkLabel(labelRoot, 'rgba(255,245,185,.95)', 'Luminosity', '3.83×10²⁶ W', 'total radiated power output');

    /* ── Projection + Label Helpers ──────────────────────────────── */
    function proj3D(v3: THREE.Vector3) {
      const v = v3.clone().project(camera);
      return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
    }
    function setLabel(el: HTMLDivElement, ln: SVGLineElement, px: number, py: number, ox: number, oy: number, lc: string, a: number) {
      const lx = px + ox, ly = py + oy;
      el.style.left = lx + 'px'; el.style.top = ly + 'px'; el.style.opacity = String(a);
      ln.setAttribute('x1', String(px)); ln.setAttribute('y1', String(py));
      ln.setAttribute('x2', String(lx)); ln.setAttribute('y2', String(ly));
      ln.setAttribute('stroke', lc); ln.setAttribute('stroke-opacity', String(a * 0.75));
      el.classList.toggle('show', a > 0.05);
    }
    function hideLabel(el: HTMLDivElement, ln: SVGLineElement) {
      el.classList.remove('show'); el.style.opacity = '0'; ln.setAttribute('stroke-opacity', '0');
    }

    /* ═══ RENDER LOOP ═══════════════════════════════════════════════ */
    let raf: number, prevT = 0, sunClock = 0, dkRot = 0;

    function animate(now: number) {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - prevT) * 0.001); prevT = now;
      const s = spRef.current;
      const W = window.innerWidth, H = window.innerHeight;
      const mob = W < 768;

      /* Stars */
      const flashV = ss(0.18, 0.25, s) * (1 - ss(0.27, 0.36, s));
      starM.opacity = 0.55 * (1 - flashV * 0.96);

      /* Black Hole */
      const bhA = 1 - ss(0.20, 0.30, s);
      bhSphereMat.opacity = bhA; bhGrp.visible = bhA > 0.001;
      if (bhGrp.visible) {
        photonRM.opacity = bhA; photonR2M.opacity = bhA * 0.6;
        dkMat.opacity = bhA; hMat.opacity = bhA * 0.85;
        glowM.opacity = bhA * 0.08; glow2M.opacity = bhA * 0.03;
        dkRot += dt * 0.38;
        const pa = dkGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < DN; i++) {
          const ox = dkOrig[i*3], oz = dkOrig[i*3+2], r = Math.sqrt(ox*ox+oz*oz);
          const ang = Math.atan2(oz, ox) + dkRot * dkSpd[i] * (1.4 / Math.max(0.6, Math.pow(r, 1.2)));
          pa[i*3] = Math.cos(ang)*r; pa[i*3+2] = Math.sin(ang)*r;
        }
        dkGeom.attributes.position.needsUpdate = true;
        const hp = hGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < HN; i++) {
          const ox = hOrig[i*3], oz = hOrig[i*3+2], r = Math.sqrt(ox*ox+oz*oz);
          const ang = Math.atan2(oz, ox) + dkRot * hSpd[i] * (2.0 / Math.max(0.5, r));
          hp[i*3] = Math.cos(ang)*r; hp[i*3+2] = Math.sin(ang)*r;
        }
        hGeom.attributes.position.needsUpdate = true;
        bhGrp.scale.setScalar(1 + ss(0.0, 0.28, s) * 0.8);
      }

      /* Transition Flare */
      const flareA = ss(0.18, 0.24, s) * (1 - ss(0.30, 0.38, s));
      flareSprMat.opacity = flareA * 0.9;
      if (flareA > 0.005) { const bloom = Math.pow(Math.sin(flareA * Math.PI), 0.6); flareSpr.scale.set(bloom * 5, bloom * 5, 1); }
      else flareSpr.scale.set(0.01, 0.01, 1);
      flashEl.style.opacity = String(flashV * 0.22);

      /* Earth */
      const eA = ss(0.30, 0.44, s) * (1 - ss(0.52, 0.58, s));
      eGrp.visible = eA > 0.001;
      if (eGrp.visible) {
        eMat.opacity = eA; atmMat.opacity = eA * 0.18; clMat.opacity = eA * 0.28;
        eMesh.rotation.y += dt * 0.10; clMesh.rotation.y += dt * 0.065;
        eGrp.scale.setScalar(0.8 + (1 - ss(0.30, 0.48, s)) * 1.4);
      }

      /* Tiny spacecraft */
      const tinyA = ss(0.50, 0.54, s) * (1 - ss(0.58, 0.62, s));
      tinyShipGrp.visible = tinyA > 0.001; tinyShipMat.opacity = tinyA;

      /* Spacecraft */
      const planeA = ss(0.58, 0.66, s) * (1 - ss(0.79, 0.85, s));
      planeGrp.visible = planeA > 0.001;
      if (planeGrp.visible) {
        planeMats.forEach(m => { (m as THREE.MeshPhongMaterial).opacity = planeA; });
        planeGrp.rotation.y = Math.sin(now * 0.00012) * 0.04;
        // Lift during bento cards, settle back for labels
        const bentoLift = ss(0.58, 0.62, s) * (1 - ss(0.70, 0.74, s));
        planeGrp.position.y = Math.sin(now * 0.00018) * 0.04 + bentoLift * (mob ? 2.5 : 1.8);

        // Exhaust
        const fx = ss(0.64, 0.70, s) * (1 - ss(0.77, 0.83, s));
        hxM.opacity = fx * 0.72;
        if (fx > 0.002) {
          const ha = hxG.attributes.position.array as Float32Array;
          for (let i = 0; i < HEAT_N; i++) {
            hxLife[i] += dt * 1.1;
            if (hxLife[i] > 1) { hxLife[i] = 0; const thIdx = i % 3; let ty = 0, tz = 0; if (thIdx === 1) { ty = -0.07; tz = 0.10; } else if (thIdx === 2) { ty = -0.07; tz = -0.10; } ha[i*3] = -1.5 + (Math.random()-0.5)*0.04; ha[i*3+1] = ty; ha[i*3+2] = tz + (Math.random()-0.5)*0.04; }
            else { ha[i*3] -= dt * (0.7 + hxLife[i] * 0.9); ha[i*3+1] += (Math.random()-0.5)*dt*0.08; }
          }
          hxG.attributes.position.needsUpdate = true;
        }

        // Spacecraft labels — viewport-relative offsets
        const labA = ss(0.67, 0.73, s) * (1 - ss(0.76, 0.82, s));
        if (labA > 0.04) {
          const wh = new THREE.Vector3(1.5,0,0), wf = new THREE.Vector3(-1.5,0,0), wa = new THREE.Vector3(-0.2,0,0.35);
          planeGrp.localToWorld(wh); planeGrp.localToWorld(wf); planeGrp.localToWorld(wa);
          const ph = proj3D(wh), pf = proj3D(wf), paa = proj3D(wa);
          const lOx = mob ? W * 0.12 : 90, lOy = mob ? -H * 0.08 : -85;
          setLabel(lblHeat, lnHeat, ph.x, ph.y, lOx, lOy, 'rgba(255,155,55,.7)', labA);
          setLabel(lblFuel, lnFuel, pf.x, pf.y, mob ? -W*0.12 : -105, mob ? -H*0.05 : -55, 'rgba(100,235,165,.7)', labA);
          setLabel(lblAero, lnAero, paa.x, paa.y, mob ? W*0.10 : 80, mob ? -H*0.10 : -105, 'rgba(80,185,255,.7)', labA);
        } else { hideLabel(lblHeat, lnHeat); hideLabel(lblFuel, lnFuel); hideLabel(lblAero, lnAero); }
      } else { hideLabel(lblHeat, lnHeat); hideLabel(lblFuel, lnFuel); hideLabel(lblAero, lnAero); }

      /* ── Camera Choreography ───────────────────────────────────── */
      const camX = 0;
      let camY = 0, camZ = 6.5;
      const zoomInEarth = ss(0.52, 0.60, s);
      camZ = 6.5 - zoomInEarth * 1.5;
      const shipCam = ss(0.62, 0.68, s) * (1 - ss(0.78, 0.84, s));
      if (shipCam > 0.01) { camZ = 5.0; camY = -shipCam * 0.08; }
      const ultraZoomOut = ss(0.80, 0.90, s);
      camZ = (shipCam > 0.01 ? 5.0 : camZ) + ultraZoomOut * 7.0;
      camY = (shipCam > 0.01 ? camY : 0) + ultraZoomOut * 0.2;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      /* Sun — persists at full scroll */
      const sunA = ss(0.86, 0.94, s);
      sGrp.visible = sunA > 0.001;
      if (sGrp.visible) {
        sunMat.uniforms.uOpa.value = sunA; chromoMat.uniforms.uOpa.value = sunA;
        sunClock += dt; sunMat.uniforms.uTime.value = sunClock;
        sGrp.rotation.y += dt * 0.012;
        coronaMats.forEach(m => { m.opacity = sunA * (m as THREE.MeshBasicMaterial & { _max: number })._max; });
        sunFlareMats.forEach((m, i) => { m.opacity = sunA * 0.48 * (0.6 + 0.4 * Math.sin(now * 0.001 * (0.7 + i * 0.3))); });
        promLineMats.forEach((m, i) => { m.opacity = sunA * 0.62 * (0.5 + 0.5 * Math.sin(now * 0.001 * (0.5 + i * 0.4) + i)); });

        planets.forEach((p, i) => {
          p.mat.opacity = sunA * 0.85; p.oMat.opacity = sunA * 0.06;
          const angle = now * 0.0003 * p.speed + i * 1.6;
          p.mesh.position.set(Math.cos(angle)*p.radius, Math.sin(p.incl)*Math.sin(angle)*p.radius*0.15, Math.sin(angle)*p.radius*0.4);
        });

        // Sun labels — viewport-relative, persist at full scroll
        const sunLabA = ss(0.88, 0.94, s);
        if (sunLabA > 0.04) {
          const coreAnc = proj3D(new THREE.Vector3(0,0,0)), surfAnc = proj3D(new THREE.Vector3(2.1,0,0)), lumAnc = proj3D(new THREE.Vector3(-0.5,2.0,0));
          setLabel(lblCore, lnCore, coreAnc.x, coreAnc.y, mob ? -W*0.15 : -W*0.22, mob ? H*0.14 : H*0.18, 'rgba(255,220,100,.7)', sunLabA);
          setLabel(lblSurf, lnSurf, surfAnc.x, surfAnc.y, mob ? W*0.08 : W*0.14, mob ? -H*0.10 : -H*0.15, 'rgba(255,155,55,.7)', sunLabA);
          setLabel(lblLum, lnLum, lumAnc.x, lumAnc.y, mob ? -W*0.12 : -W*0.18, mob ? -H*0.10 : -H*0.14, 'rgba(255,245,185,.7)', sunLabA);
        } else { hideLabel(lblCore, lnCore); hideLabel(lblSurf, lnSurf); hideLabel(lblLum, lnLum); }
      } else { hideLabel(lblCore, lnCore); hideLabel(lblSurf, lnSurf); hideLabel(lblLum, lnLum); }

      renderer.render(scene, camera);
    }

    animate(0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ── Cleanup ──────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', handleScroll);
      scene.traverse((o: THREE.Object3D) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) { const mats = Array.isArray(m.material) ? m.material : [m.material]; mats.forEach(mt => { if ((mt as THREE.MeshBasicMaterial).map) (mt as THREE.MeshBasicMaterial).map?.dispose(); mt.dispose(); }); }
      });
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      flashEl.remove(); labelRoot.remove(); svgEl.remove();
    };
  }, [handleScroll]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div ref={mountRef} className="qh-canvas-wrap" />
      <div className="qh-grain" />
    </div>
  );
}
