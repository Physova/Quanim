# Physova V3.1 — Visual Polish & Feedback Fixes

Comprehensive implementation plan addressing all feedback from the SingerBoy discussion (April 29, 2026).
**All decisions confirmed by owner on May 3, 2026.**

---

## Decisions (Confirmed)

- ✅ **Switzer font** replaces Geist as sans-serif (via Fontshare CDN)
- ✅ **Photon ring REMOVED** — the bright arc/ring on top of the black void sphere is deleted. Particles stay.
- ✅ **Background brown circle REMOVED** — faint brownish glow over particles is deleted (glow spheres)
- ✅ **Sun labels REMOVED** — they overlap with community text
- ✅ **Monochrome kept** — no colored backgrounds, just grey shades for depth
- ✅ **Spaceship Phase 3** — appears only AFTER bento cards scroll away, not during. Also fix mobile fitting.

---

## All Changes (12 Issues + 2 Additions)

---

### 1. Black Hole Scene — Remove Background Glow Circle + Remove Photon Ring

**Source**: *"remove these elements in the centre along with the bg circle"* + owner clarification: *"remove the bright ring on top of void circle, not particles"*

**Files**: `components/visuals/physova-hero.tsx`

**What to delete**:
1. **Glow spheres** (the faint brown circle covering the particles):
   - Line ~205-206: `glowM` — orange glow, `SphereGeometry(3.2)`, `THREE.BackSide` — DELETE mesh + material
   - Line ~207-208: `glow2M` — red glow, `SphereGeometry(5.5)`, `THREE.BackSide` — DELETE mesh + material

2. **Photon rings** (the bright arc on the black sphere):
   - Line ~168-169: `photonRM` + `photonR` — warm ring `RingGeometry(0.975, 1.19)` — DELETE mesh + material
   - Line ~170-171: `photonR2M` + `photonR2` — blue ring `RingGeometry(0.965, 1.05)` — DELETE mesh + material

3. **Render loop cleanup** — remove opacity references:
   - Line ~377: Remove `photonRM.opacity = bhA;` and `photonR2M.opacity = bhA * 0.6;`
   - Line ~379: Remove `glowM.opacity = bhA * 0.08;` and `glow2M.opacity = bhA * 0.03;`

**What stays**: Black sphere (`bhSphereMat`), accretion disk particles (`dkPts`), inner ISCO band particles (`hPts`).

---

### 2. "The Community" Text — Keep Static (No Fade-Out)

**Source**: *"keep the scroll animation of the text static"*

**File**: `app/landing-client.tsx`, line 49

```diff
- const stage4Opacity = useTransform(smoothProgress, [0.82, 0.87, 0.91, 1], [0, 1, 1, 0.3]);
+ const stage4Opacity = useTransform(smoothProgress, [0.82, 0.87, 1], [0, 1, 1]);
```

Community text fades in and STAYS at full opacity.

---

### 3. Spaceship — Appear AFTER Phase 3 Bento Cards (Not During)

**Source**: *"half of rocket in navbar here"* + owner: *"make it appear only after-scroll of phase 3 so it isnt stuck above in a weird manner"*

**File**: `components/visuals/physova-hero.tsx`

Currently the spaceship appears at `ss(0.58, 0.66, s)` which overlaps with bento cards (0.55-0.74). Fix:

**A) Delay spaceship appearance to AFTER bento** (line ~419):
```diff
- const planeA = ss(0.58, 0.66, s) * (1 - ss(0.79, 0.85, s));
+ const planeA = ss(0.72, 0.78, s) * (1 - ss(0.82, 0.87, s));
```

Spaceship now only appears at scroll 0.72+ (when bento is fading out at 0.74) and disappears before community.

**B) Remove `bentoLift`** — no longer needed since spaceship doesn't overlap bento (line ~425-426):
```diff
- const bentoLift = ss(0.58, 0.62, s) * (1 - ss(0.70, 0.74, s));
- planeGrp.position.y = Math.sin(now * 0.00018) * 0.04 + bentoLift * (mob ? 2.5 : 1.8);
+ planeGrp.position.y = Math.sin(now * 0.00018) * 0.04;
```

**C) Reduce spaceship scale on mobile** for fitting (line ~237):
```diff
- planeGrp.scale.setScalar(isMobile ? 1.2 : 1.8);
+ planeGrp.scale.setScalar(isMobile ? 0.9 : 1.8);
```

**D) Update spaceship label timing** to match new appearance range (line ~442):
```diff
- const labA = ss(0.67, 0.73, s) * (1 - ss(0.76, 0.82, s));
+ const labA = ss(0.74, 0.79, s) * (1 - ss(0.81, 0.86, s));
```

**E) Update exhaust timing** (line ~429):
```diff
- const fx = ss(0.64, 0.70, s) * (1 - ss(0.77, 0.83, s));
+ const fx = ss(0.74, 0.78, s) * (1 - ss(0.82, 0.86, s));
```

**F) Update tiny spacecraft timing** — the small ship that transitions into the big one (line ~415):
```diff
- const tinyA = ss(0.50, 0.54, s) * (1 - ss(0.58, 0.62, s));
+ const tinyA = ss(0.68, 0.72, s) * (1 - ss(0.74, 0.78, s));
```

**G) Update camera choreography** to match (lines ~457-463):
```diff
- const zoomInEarth = ss(0.52, 0.60, s);
+ const zoomInEarth = ss(0.52, 0.58, s);
  camZ = 6.5 - zoomInEarth * 1.5;
- const shipCam = ss(0.62, 0.68, s) * (1 - ss(0.78, 0.84, s));
+ const shipCam = ss(0.74, 0.78, s) * (1 - ss(0.82, 0.87, s));
  if (shipCam > 0.01) { camZ = 5.0; camY = -shipCam * 0.08; }
- const ultraZoomOut = ss(0.80, 0.90, s);
+ const ultraZoomOut = ss(0.84, 0.92, s);
```

---

### 4. Earth Scene — Remove Small White Line Artifact

**Source**: *"there's a very small white line near the earth here"*

**File**: `components/visuals/physova-hero.tsx`, inside `mkEarthTex()` function, line ~67

```diff
- x.fillStyle = '#ddeeff'; x.globalAlpha = 0.8;
- x.fillRect(0, 0, W, 16); x.fillRect(0, H - 13, W, 13);
+ x.fillStyle = '#ddeeff'; x.globalAlpha = 0.5;
+ x.fillRect(0, 0, W, 10); x.fillRect(0, H - 8, W, 8);
```

Thinner, more transparent polar caps = no visible white seam.

---

### 5. Topics Page — Fix "Grade 9" Baseline Alignment

**Source**: *"'9' is way lower than the word 'Grade'"*

**File**: `components/visuals/topics-list.tsx`, line ~106

```diff
- <h2 className="text-lg md:text-xl font-serif font-bold uppercase tracking-tighter text-white/70">
+ <h2 className="text-lg md:text-xl font-sans font-bold uppercase tracking-tight text-white/70">
```

Switch from `font-serif` (Playfair — has old-style descending numerals) to `font-sans` (Switzer — lining numerals, baseline-aligned).

---

### 6. Topics Page — Add More Letter Spacing to "PHYSICS TOPICS" Heading

**Source**: *"will it be possible to make the letters a bit more spaced out?"*

**File**: `components/visuals/topics-list.tsx`, line ~88

```diff
- <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tighter text-white uppercase">
+ <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-wide text-white uppercase">
```

---

### 7. Navbar — Fix Size, Contrast, and Logo Spacing

**Source**: *"navbar text kinda smol"*, *"dark-colored words barely have any contrast"*, *"letters in Physova look too spaced out"*

**File**: `components/navbar.tsx`

**A) Nav links — bigger + more contrast** (line ~39):
```diff
- "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
+ "bg-transparent hover:bg-white/5 text-white/60 hover:text-white transition-all font-bold text-xs uppercase tracking-[0.15em]"
```

**B) Physova logo — tighter spacing** (line ~29):
```diff
- <span className="text-base font-bold tracking-[0.2em] uppercase text-foreground ...">
+ <span className="text-base font-bold tracking-[0.08em] uppercase text-foreground ...">
```

**C) Sign In link — better contrast** (line ~80):
```diff
- className="... text-[10px] font-bold text-muted-foreground hover:text-foreground ... tracking-[0.2em] ..."
+ className="... text-xs font-bold text-white/50 hover:text-white ... tracking-[0.15em] ..."
```

---

### 8. Font Consistency — Unify with Switzer

**Source**: *"why does every phase have a diff font?"* + *"look at Switzer"*

**File**: `app/layout.tsx`
- Remove `Geist` import and `geistSans` variable
- Remove `${geistSans.variable}` from body className

**File**: `app/globals.css`
- Add `@import url('https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap');` at top
- Add `--font-sans: "Switzer", system-ui, -apple-system, sans-serif;` in `:root`

**File**: `components/visuals/bento-sections.tsx`
- Card title: `font-mono` → `font-sans`
- "The Discovery" heading: `font-mono` → `font-serif` (matches Phases 1 & 4)

**Font map after change**:
| Element | Font |
|---|---|
| Hero wordmark "Physova" | Playfair Display (serif) |
| Phase headings | Playfair Display (serif) |
| Body text, UI, navbar | Switzer (sans) |
| Cipher animation, labels | JetBrains Mono (mono) |
| Data readouts, small tags | JetBrains Mono (mono) |

---

### 9. Landing Page Phase 3 — Fix Unequal Module Card Sizes

**Source**: *"first module size is smaller than the second one"*

**File**: `components/visuals/bento-sections.tsx`

Grid container (line ~107):
```diff
- <div className={`flex overflow-x-auto md:grid ${gridCols} gap-4 md:gap-6 ...`}>
+ <div className={`flex overflow-x-auto md:grid ${gridCols} gap-4 md:gap-6 ... md:auto-rows-[1fr]`}>
```

Card wrapper (line ~110):
```diff
- <div key={topic.slug} className="min-w-[85vw] md:min-w-0 snap-center">
+ <div key={topic.slug} className="min-w-[85vw] md:min-w-0 snap-center h-full">
```

---

### 10. Topics Page — Add Grey Depth (Monochrome Enhancement)

**Source**: *"u can add shades of grey to still keep it monochrome"*

**File**: `app/topics/page.tsx` — add subtle gradient overlay:
```diff
  <div className="min-h-screen bg-background relative overflow-hidden">
+   <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
    <TopicsList topics={topics} />
  </div>
```

**File**: `components/visuals/topics-list.tsx` — add bottom border to header section:
```diff
- className="flex flex-col items-center mb-16 text-center"
+ className="flex flex-col items-center mb-16 text-center py-12 border-b border-white/5"
```

---

### 11. Mobile Nav — Update Logo Spacing

**File**: `components/mobile-nav.tsx`, line ~30:
```diff
- <span className="text-base font-bold tracking-[0.2em] uppercase text-foreground">
+ <span className="text-base font-bold tracking-[0.08em] uppercase text-foreground">
```

---

### 12. Sun Labels — Remove Entirely

**Source**: *"u may remove sun labels"*

**File**: `components/visuals/physova-hero.tsx`

Delete:
- Label creation lines (~338-340): `lblCore`, `lblSurf`, `lblLum`
- SVG line creation (~334): `lnCore`, `lnSurf`, `lnLum`
- All `setLabel`/`hideLabel` calls for these 6 elements in the sun render section (~485-492)
- Keep a single `hideLabel` fallback in the else branch for safety, or remove entirely

---

## File Change Summary

| # | Issue | File(s) | Type |
|---|---|---|---|
| 1 | Remove brown bg glow + photon ring | `physova-hero.tsx` | 3D scene |
| 2 | Community text stays fully visible | `landing-client.tsx` | Animation |
| 3 | Spaceship after bento + mobile fix | `physova-hero.tsx` | Timing + scale |
| 4 | White line near Earth | `physova-hero.tsx` | Texture |
| 5 | "Grade 9" baseline | `topics-list.tsx` | Typography |
| 6 | Topics heading spacing | `topics-list.tsx` | Typography |
| 7 | Navbar size/contrast/logo | `navbar.tsx` | UI |
| 8 | Font unification (Switzer) | `layout.tsx`, `globals.css`, `bento-sections.tsx` | Global |
| 9 | Equal card sizes | `bento-sections.tsx` | Layout |
| 10 | Grey depth Topics page | `topics-list.tsx`, `topics/page.tsx` | Visual |
| 11 | Mobile nav logo spacing | `mobile-nav.tsx` | Consistency |
| 12 | Remove sun labels | `physova-hero.tsx` | UX cleanup |

---

## Verification Plan

### Build Check
```bash
npm run build
```

### Browser Checks
1. Landing page full scroll — all 4 stages display correctly
2. Stage 1: Black sphere + particles only, NO glow, NO bright ring
3. Stage 2: Earth no white line
4. Stage 3: Bento cards equal size, spaceship NOT visible during cards
5. Between Stage 3→4: Spaceship appears after bento fades, fits on mobile
6. Stage 4: Community text stays at full opacity, no sun labels
7. Navbar: bigger text, more contrast, tighter Physova spacing
8. Topics page: "Grade 9" aligned, heading more spaced, grey gradient
9. Switzer font renders everywhere sans-serif is used
10. Mobile 375px + iPad checks
