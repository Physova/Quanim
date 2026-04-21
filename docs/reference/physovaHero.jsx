import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import './PhysovaHero.css'

// ─── Scene metadata ───────────────────────────────────────────────────────
const SCENES = [
  {
    id: 'singularity',
    range: [0.02, 0.28],
    label: 'ASTROPHYSICS',
    heading: ['THE', 'SINGULARITY'],
    sub: 'Where spacetime collapses — and physics meets its own edge.',
    accent: '#ff6b2b',
  },
  {
    id: 'earth',
    range: [0.40, 0.68],
    label: 'CLASSICAL MECHANICS',
    heading: ['GRAVITY', 'WRITES THE RULES'],
    sub: 'Orbits. Tides. Weight. One invisible force shaping everything you know.',
    accent: '#4fc3f7',
  },
  {
    id: 'sun',
    range: [0.76, 0.96],
    label: 'STELLAR PHYSICS',
    heading: ['BORN FROM', 'STELLAR FIRE'],
    sub: 'Every atom in your body was forged inside a dying star.',
    accent: '#ffb347',
  },
]

const ss = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

export default function PhysovaHero() {
  const mountRef     = useRef(null)
  const containerRef = useRef(null)
  const spRef        = useRef(0)

  const [scrollPct, setScrollPct] = useState(0)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [textKey,   setTextKey]   = useState(0)
  const lastIdxRef  = useRef(-1)

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const sectionH = container.offsetHeight - window.innerHeight
    const scrolled  = Math.max(0, window.scrollY - container.offsetTop)
    const pct       = Math.min(1, scrolled / Math.max(1, sectionH))
    spRef.current   = pct
    setScrollPct(pct)

    let newIdx = -1
    SCENES.forEach((s, i) => {
      if (pct >= s.range[0] && pct <= s.range[1]) newIdx = i
    })
    if (newIdx !== lastIdxRef.current) {
      lastIdxRef.current = newIdx
      setActiveIdx(newIdx)
      setTextKey(k => k + 1)
    }
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 1)
    mount.appendChild(renderer.domElement)

    const threeScene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.01, 1000)
    camera.position.z = 6.5

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Stars ─────────────────────────────────────────────────────────────
    const SN = 3500
    const sb = new Float32Array(SN * 3)
    for (let i = 0; i < SN; i++) {
      sb[i*3]   = (Math.random() - 0.5) * 160
      sb[i*3+1] = (Math.random() - 0.5) * 160
      sb[i*3+2] = -35 - Math.random() * 65
    }
    const starG = new THREE.BufferGeometry()
    starG.setAttribute('position', new THREE.BufferAttribute(sb, 3))
    const starM = new THREE.PointsMaterial({
      size: 0.07, color: 0xffffff, transparent: true, opacity: 0.55,
    })
    threeScene.add(new THREE.Points(starG, starM))

    // ── BLACK HOLE ────────────────────────────────────────────────────────
    const bhGrp = new THREE.Group()
    threeScene.add(bhGrp)

    // Event horizon
    bhGrp.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    ))

    // Photon ring — ultra-thin, blindingly bright
    const photonRingM = new THREE.MeshBasicMaterial({
      color: 0xfff0cc, transparent: true, opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const photonRing = new THREE.Mesh(new THREE.RingGeometry(0.975, 1.19, 256), photonRingM)
    photonRing.rotation.x = Math.PI * 0.27
    bhGrp.add(photonRing)

    // Blue-tinted inner photon sphere (approaching-side doppler)
    const photonRing2M = new THREE.MeshBasicMaterial({
      color: 0x88ccff, transparent: true, opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const photonRing2 = new THREE.Mesh(new THREE.RingGeometry(0.965, 1.05, 256), photonRing2M)
    photonRing2.rotation.x = Math.PI * 0.27
    bhGrp.add(photonRing2)

    // Accretion disk — 22 000 particles, Keplerian, doppler colours
    const DN = 22000
    const dkPos  = new Float32Array(DN * 3)
    const dkOrig = new Float32Array(DN * 3)
    const dkSpd  = new Float32Array(DN)
    const dkCol  = new Float32Array(DN * 3)

    for (let i = 0; i < DN; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 1.18 + Math.pow(Math.random(), 0.6) * 2.7
      const h = (Math.random() - 0.5) * 0.07 * Math.max(0.5, r - 1.0)
      dkOrig[i*3]   = Math.cos(a) * r
      dkOrig[i*3+1] = h
      dkOrig[i*3+2] = Math.sin(a) * r
      dkPos[i*3]    = dkOrig[i*3]; dkPos[i*3+1] = dkOrig[i*3+1]; dkPos[i*3+2] = dkOrig[i*3+2]
      dkSpd[i] = 0.4 + Math.random() * 0.6

      const rNorm   = Math.max(0, (r - 1.18) / 2.7)
      const temp    = Math.pow(1 - rNorm, 1.8)
      const approach = (Math.sin(a) + 1) * 0.5

      dkCol[i*3]   = Math.min(1, temp * 1.1 + 0.15)
      dkCol[i*3+1] = Math.min(1, temp * 0.65 * (0.6 + 0.4 * approach) * 0.8)
      dkCol[i*3+2] = Math.min(1, approach * 0.55 * (1 - temp * 0.6) * 0.35)
    }

    const dkGeom = new THREE.BufferGeometry()
    dkGeom.setAttribute('position', new THREE.BufferAttribute(dkPos, 3))
    dkGeom.setAttribute('color',    new THREE.BufferAttribute(dkCol, 3))
    const dkMat = new THREE.PointsMaterial({
      size: 0.015, vertexColors: true, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const dkPts = new THREE.Points(dkGeom, dkMat)
    dkPts.rotation.x = Math.PI * 0.27
    bhGrp.add(dkPts)

    // Inner ISCO band — smaller, hotter, faster particles
    const HN = 4000
    const hPos  = new Float32Array(HN * 3)
    const hOrig = new Float32Array(HN * 3)
    const hSpd  = new Float32Array(HN)
    for (let i = 0; i < HN; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 1.18 + Math.pow(Math.random(), 2.5) * 0.55
      const h = (Math.random() - 0.5) * 0.04
      hOrig[i*3] = Math.cos(a)*r; hOrig[i*3+1] = h; hOrig[i*3+2] = Math.sin(a)*r
      hPos[i*3]  = hOrig[i*3];   hPos[i*3+1]  = hOrig[i*3+1];  hPos[i*3+2]  = hOrig[i*3+2]
      hSpd[i] = 0.7 + Math.random() * 0.5
    }
    const hGeom = new THREE.BufferGeometry()
    hGeom.setAttribute('position', new THREE.BufferAttribute(hPos, 3))
    const hMat = new THREE.PointsMaterial({
      size: 0.026, color: 0xfff4e0, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const hPts = new THREE.Points(hGeom, hMat)
    hPts.rotation.x = Math.PI * 0.27
    bhGrp.add(hPts)

    // Gravitational glow (two layers)
    const glowM = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(3.2, 32, 32), glowM))

    const glow2M = new THREE.MeshBasicMaterial({
      color: 0xff2200, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
    bhGrp.add(new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 32), glow2M))

    // ── EARTH ─────────────────────────────────────────────────────────────
    const eGrp = new THREE.Group()
    threeScene.add(eGrp)

    const mkEarthTex = () => {
      const W = 1024, H = 512
      const cvs = document.createElement('canvas')
      cvs.width = W; cvs.height = H
      const ctx = cvs.getContext('2d')
      ctx.fillStyle = '#0c2848'; ctx.fillRect(0, 0, W, H)
      const og = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2)
      og.addColorStop(0, 'rgba(5,80,160,.35)')
      og.addColorStop(1, 'rgba(0,0,0,.55)')
      ctx.fillStyle = og; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#1d5e28'
      ;[[160,150,100,90],[195,230,58,88],[440,138,64,58],
        [465,255,58,118],[595,128,152,98],[698,208,58,48],[742,328,66,38]
      ].forEach(([cx,cy,rw,rh]) => {
        ctx.beginPath(); ctx.ellipse(cx, cy, rw/2, rh/2, 0, 0, Math.PI*2); ctx.fill()
      })
      ctx.fillStyle = '#ddeeff'; ctx.globalAlpha = 0.85
      ctx.fillRect(0, 0, W, 18); ctx.fillRect(0, H-14, W, 14)
      ctx.globalAlpha = 1
      ctx.fillStyle = '#ffffaa'; ctx.globalAlpha = 0.7
      ;[[160,150],[195,230],[440,138],[465,255],[595,128],[698,208],[742,328]].forEach(([cx,cy]) => {
        for (let i = 0; i < 28; i++) {
          ctx.beginPath()
          ctx.arc(cx + (Math.random()-0.5)*75, cy + (Math.random()-0.5)*55, Math.random()*1.5+0.4, 0, Math.PI*2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1
      return new THREE.CanvasTexture(cvs)
    }

    const eMat = new THREE.MeshPhongMaterial({
      map: mkEarthTex(), transparent: true, opacity: 0,
      specular: new THREE.Color(0.2, 0.45, 0.9), shininess: 18,
    })
    const eMesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), eMat)
    eGrp.add(eMesh)

    const atmMat = new THREE.MeshBasicMaterial({
      color: 0x1166ff, transparent: true, opacity: 0,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
    eGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.48, 32, 32), atmMat))

    const mkCloudTex = () => {
      const cvs = document.createElement('canvas'); cvs.width = 512; cvs.height = 256
      const ctx = cvs.getContext('2d'); ctx.clearRect(0, 0, 512, 256)
      ctx.fillStyle = 'rgba(255,255,255,.22)'
      for (let i = 0; i < 48; i++) {
        ctx.beginPath()
        ctx.ellipse(Math.random()*512, Math.random()*256, Math.random()*55+12, Math.random()*16+4, Math.random()*Math.PI, 0, Math.PI*2)
        ctx.fill()
      }
      return new THREE.CanvasTexture(cvs)
    }
    const clMat = new THREE.MeshBasicMaterial({
      map: mkCloudTex(), transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const clMesh = new THREE.Mesh(new THREE.SphereGeometry(1.39, 32, 32), clMat)
    clMesh.rotation.y = 0.4; eGrp.add(clMesh)

    const dLight = new THREE.DirectionalLight(0xffffff, 1.9)
    dLight.position.set(4, 1, 3); threeScene.add(dLight)
    threeScene.add(new THREE.AmbientLight(0x102040, 0.75))

    // ── SUN ───────────────────────────────────────────────────────────────
    const sGrp = new THREE.Group()
    threeScene.add(sGrp)

    const sunMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpa: { value: 0 } },
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
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
      `,
    })
    sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(1.9, 64, 64), sunMat))

    const coronaDefs = [
      { r: 2.25, col: 0xff8c00, max: 0.14 },
      { r: 2.75, col: 0xff5500, max: 0.08 },
      { r: 3.5,  col: 0xff2200, max: 0.04 },
      { r: 5.0,  col: 0xff1100, max: 0.02 },
    ]
    const coronaMats = coronaDefs.map(({ r, col, max }) => {
      const m = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      m._max = max
      sGrp.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m))
      return m
    })

    const flareDefs = [
      { dir: [0.8, 0.5, 0],     sc: [0.08, 0.55, 0.08], col: 0xff7700 },
      { dir: [-0.4, 0.9, 0.3],  sc: [0.07, 0.42, 0.07], col: 0xff4400 },
      { dir: [0.2, -0.85, 0.5], sc: [0.06, 0.38, 0.06], col: 0xff8800 },
    ]
    const flareMats = flareDefs.map(({ dir, sc, col }) => {
      const m = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), m)
      mesh.scale.set(...sc)
      const len = Math.hypot(...dir)
      mesh.position.set(dir[0]/len * 2.1, dir[1]/len * 2.1, dir[2]/len * 2.1)
      mesh.lookAt(0, 0, 0)
      sGrp.add(mesh)
      return m
    })

    // ── Flash DOM overlay ─────────────────────────────────────────────────
    const flashEl = document.createElement('div')
    Object.assign(flashEl.style, {
      position:'fixed',inset:'0',background:'#fff',
      opacity:'0',pointerEvents:'none',zIndex:'8',
    })
    document.body.appendChild(flashEl)

    // ── Render loop ───────────────────────────────────────────────────────
    let raf     = null
    let prevNow = 0
    let dkRot   = 0
    let sunClock = 0

    function animate(now) {
      raf = requestAnimationFrame(animate)
      const dt = Math.min(0.05, (now - prevNow) * 0.001)
      prevNow  = now
      const s  = spRef.current

      // Stars fade during flash
      starM.opacity = 0.55 * (1 - ss(0.18, 0.28, s) * 0.94)

      // ─ Black Hole ────────────────────────────────────────────────────
      const bhA = ss(0, 0.04, s) * (1 - ss(0.21, 0.33, s))
      photonRingM.opacity  = bhA * 1.0
      photonRing2M.opacity = bhA * 0.6
      dkMat.opacity  = bhA * 1.0
      hMat.opacity   = bhA * 0.85
      glowM.opacity  = bhA * 0.08
      glow2M.opacity = bhA * 0.03

      if (bhA > 0.002) {
        dkRot += dt * 0.38
        const pa = dkGeom.attributes.position.array
        for (let i = 0; i < DN; i++) {
          const ox = dkOrig[i*3], oz = dkOrig[i*3+2]
          const r  = Math.sqrt(ox*ox + oz*oz)
          const ang = Math.atan2(oz, ox) + dkRot * dkSpd[i] * (1.4 / Math.max(0.6, Math.pow(r, 1.2)))
          pa[i*3]   = Math.cos(ang) * r
          pa[i*3+2] = Math.sin(ang) * r
        }
        dkGeom.attributes.position.needsUpdate = true

        const hp = hGeom.attributes.position.array
        for (let i = 0; i < HN; i++) {
          const ox = hOrig[i*3], oz = hOrig[i*3+2]
          const r  = Math.sqrt(ox*ox + oz*oz)
          const ang = Math.atan2(oz, ox) + dkRot * hSpd[i] * (2.0 / Math.max(0.5, r))
          hp[i*3]   = Math.cos(ang) * r
          hp[i*3+2] = Math.sin(ang) * r
        }
        hGeom.attributes.position.needsUpdate = true
      }

      bhGrp.scale.setScalar(1 + ss(0.13, 0.28, s) * 0.6)

      // ─ Flash ──────────────────────────────────────────────────────────
      const flash = ss(0.19, 0.255, s) * (1 - ss(0.255, 0.36, s))
      flashEl.style.opacity = String(flash)

      // ─ Earth ──────────────────────────────────────────────────────────
      const eA = ss(0.34, 0.47, s) * (1 - ss(0.72, 0.83, s))
      eMat.opacity   = eA
      atmMat.opacity = eA * 0.20
      clMat.opacity  = eA * 0.22

      if (eA > 0.002) {
        eMesh.rotation.y  += dt * 0.10
        clMesh.rotation.y += dt * 0.065
        eGrp.position.x = ss(0.52, 0.67, s) * 2.6
      }

      // ─ Sun ────────────────────────────────────────────────────────────
      const sunA = ss(0.73, 0.85, s) * (1 - ss(0.95, 1.0, s))
      sunMat.uniforms.uOpa.value = sunA
      if (sunA > 0.002) {
        sunClock += dt
        sunMat.uniforms.uTime.value = sunClock
        sGrp.rotation.y += dt * 0.015
      }
      coronaMats.forEach(m => { m.opacity = sunA * m._max })
      flareMats.forEach((m, i) => {
        const pulse = 0.6 + 0.4 * Math.sin(now * 0.001 * (0.7 + i * 0.3))
        m.opacity = sunA * 0.45 * pulse
      })

      renderer.render(threeScene, camera)
    }

    animate(0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', handleScroll)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
      if (flashEl.parentNode) flashEl.remove()
    }
  }, [handleScroll])

  const sceneData = activeIdx >= 0 ? SCENES[activeIdx] : null
  const pctLabel  = String(Math.round(scrollPct * 100)).padStart(3, '0') + '%'
  const textIn    = sceneData !== null &&
    scrollPct >= sceneData.range[0] + 0.05 &&
    scrollPct <= sceneData.range[1] - 0.05

  const stageLabel = scrollPct < 0.32 ? 'THE SINGULARITY'
    : scrollPct < 0.40 ? 'WARP TRANSITION'
    : scrollPct < 0.73 ? 'SCALE OF LIFE'
    : scrollPct < 0.85 ? 'STELLAR PHYSICS'
    : 'THE VOID'

  return (
    <div ref={containerRef} className="qh-container">
      <div className="qh-sticky">

        {/* Three.js canvas */}
        <div ref={mountRef} className="qh-canvas-wrap" />

        {/* Film grain */}
        <div className="qh-grain" />

        {/* Vertical stage label */}
        <div className="qh-stage-label">{stageLabel}</div>

        {/* Left scene dots */}
        <div className="qh-dots">
          {SCENES.map((s, i) => (
            <div
              key={i}
              className={`qh-dot${i === activeIdx ? ' active' : ''}${scrollPct >= s.range[0] ? ' passed' : ''}`}
              style={{ '--accent': s.accent }}
            />
          ))}
        </div>

        {/* Text overlay */}
        {sceneData && (
          <div className="qh-overlay" style={{ '--accent': sceneData.accent }}>
            <p  key={`lbl-${textKey}`}  className={`qh-scene-label${textIn ? ' in' : ''}`}>{sceneData.label}</p>
            <h2 key={`h-${textKey}`}    className={`qh-headline${textIn ? ' in' : ''}`}>
              {sceneData.heading.map((line, i) => (
                <span key={i} className="qh-headline-line">{line}</span>
              ))}
            </h2>
            <p  key={`sub-${textKey}`}  className={`qh-sub${textIn ? ' in' : ''}`}>{sceneData.sub}</p>
          </div>
        )}

        {/* Right progress rail */}
        <div className="qh-rail">
          <div className="qh-rail-fill" style={{ transform: `scaleY(${scrollPct})` }} />
          <div className="qh-rail-pct">{pctLabel}</div>
        </div>

        {/* Scroll cue */}
        <div className={`qh-cue${scrollPct > 0.04 ? ' hidden' : ''}`}>
          <span className="qh-cue-text">scroll</span>
          <span className="qh-cue-line" />
        </div>

      </div>
    </div>
  )
}
