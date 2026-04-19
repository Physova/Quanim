# Quanim Design Overhaul — Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Strip all colored, vibecoded UI from content pages and enforce the landing page's minimalist monochrome aesthetic across the entire application.

**Architecture:** Pure CSS/Tailwind class overhaul. No structural changes, no new dependencies, no new files. Every file is a class-swap operation.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, Framer Motion (existing), Geist/Playfair Display fonts (existing)

---

## Design Tokens (THE LAW — every file must obey these)

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `bg-black` or `bg-background` | All page/card backgrounds |
| `text-primary` | `text-white` | Headings, primary text |
| `text-secondary` | `text-white/50` | Body text, descriptions |
| `text-tertiary` | `text-white/30` | Metadata, timestamps, minor labels |
| `text-micro` | `text-white/20` | Footer legalese, version numbers |
| `border` | `border-white/5` (default), `border-white/10` (cards) | All borders |
| `border-hover` | `border-white/40` | Hover state for interactive elements |
| `heading-font` | `font-serif` (Playfair Display) | All page titles, section headings |
| `label-font` | `font-mono` | All micro-labels, metadata, tags |
| `label-style` | `text-[10px] font-mono font-bold uppercase tracking-[0.2em]` | Standard micro-label |
| `heading-style` | `font-serif font-bold tracking-tighter uppercase` | Standard heading |
| `card-bg` | `bg-white/[0.02]` or `bg-black` | Card backgrounds |
| `card-border` | `border border-white/10` | Card borders |
| `card-hover` | `hover:border-white/40` | Card hover |
| `radius` | `rounded-none` | ALL elements, zero exceptions |
| `cta-primary` | `bg-white text-black` | Primary buttons (JOIN_VOID style) |
| `cta-ghost` | `text-white/50 hover:text-white` | Ghost/text buttons |
| `glass` | `backdrop-blur-xl bg-black/60` | Glassmorphism panels |

## KILL LIST — Banned patterns (search-and-destroy)

Every occurrence of these MUST be removed from every file:

| Pattern | Reason |
|---------|--------|
| `cyan-*` (any shade) | Vibecoded accent color |
| `violet-*` (any shade) | Vibecoded accent color |
| `emerald-*` (any shade) | Vibecoded accent color |
| `amber-*` (any shade) | Vibecoded accent color — replace with `white` |
| `pink-*` (any shade) | Vibecoded accent color |
| `blue-*` (any shade, except simulation physics canvas internals) | Vibecoded accent color |
| `purple-*` (any shade) | Vibecoded accent color |
| `gold` / `text-gold` | Legacy design system color |
| `rounded-full` | Pill shapes banned (except avatar fallbacks) |
| `rounded-[2rem]` / `rounded-[2.5rem]` / `rounded-xl` / `rounded-2xl` / `rounded-lg` | All rounding banned |
| `shadow-[0_0_*]` | Glow shadows banned |
| `animate-pulse` (decorative) | Garish pulsing banned |
| `animate-ping` | Garish pinging banned |
| Emojis in MDX headings | Unprofessional |
| `bg-gradient-to-r from-[#ff8c00] to-[#4488dd]` | Footer gradient banned |

---

## Task 1: Topics Index Page

**Files:**
- Modify: `app/topics/page.tsx`
- Modify: `components/visuals/topics-list.tsx`

### Step 1: `app/topics/page.tsx` — Remove colored background blobs

Replace the background decorative div (lines 10-13) with an empty comment. The body already has the dot-grid.

**Before:**
```tsx
<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
</div>
```

**After:**
```tsx
{/* Background handled by body dot-grid */}
```

### Step 2: `components/visuals/topics-list.tsx` — Full monochrome rewrite

**Line 37-40 — Badge:** Replace icon badge with plain mono label.

**Before:**
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
  <BookOpen className="w-3 h-3" />
  Repository
</div>
```

**After:**
```tsx
<span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30 mb-6 block">
  // Repository
</span>
```

**Lines 57-70 — Kill colored difficulty system.** DELETE `difficultyColors` and `glowColors` objects entirely. DELETE the `borderColor` and `glowColor` const derivations.

**Line 74 — Card className:** Replace dynamic border color:

**After:**
```tsx
<Card className="h-full flex flex-col bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group overflow-hidden relative rounded-none">
```

**Line 76 — Kill accent glow div entirely (delete it).**

**Line 80-82 — Difficulty badge:** Make plain mono label (no border, no bg):
```tsx
<span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
  {topic.difficulty}
</span>
```

**Lines 83-86 — Date:** Remove Clock icon. Plain text:
```tsx
<span className="text-[10px] font-mono text-white/20 uppercase tracking-tight">
  {topic.publishedAt}
</span>
```

**Line 88 — Title:** Ensure serif:
```tsx
<CardTitle className="text-xl font-serif font-bold tracking-tighter text-white uppercase">
```

**Line 91 — Description:**
```tsx
<CardDescription className="line-clamp-2 text-white/40 text-sm leading-relaxed mt-2">
```

**Lines 97-104 — Tags:** Remove Tag icon. Plain mono text:
```tsx
<span key={tag} className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.15em]">
  {tag.toUpperCase()}
</span>
```

**Lines 107-114 — Footer button:** Already correct with `hover:bg-white hover:text-black`. Keep.

**Clean up imports:** Remove `Clock`, `Tag`, `BookOpen` from lucide-react if no longer used.

---

## Task 2: Article Layout (Topic Detail Page)

**Files:**
- Modify: `app/topics/[slug]/page.tsx`
- Modify: `components/mdx-content.tsx`

### Step 1: `app/topics/[slug]/page.tsx`

**Lines 55-58 — Kill colored background blobs (delete them).**

**Lines 63-68 — Back button:**
Change `text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5` to `text-white/40 hover:text-white hover:bg-white/5`

**Lines 71-76 — Share/Info icon buttons:**
Change `hover:border-cyan-500/50 hover:text-cyan-400` to `hover:border-white/40 hover:text-white`
Change `hover:border-violet-500/50 hover:text-violet-400` to `hover:border-white/40 hover:text-white`

**Lines 85-91 — Difficulty badge (replace entire ternary):**
```tsx
<span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
  {frontmatter.difficulty}
</span>
```

**Lines 92-95 — Date:** Remove Clock icon:
```tsx
<span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.15em]">
  {frontmatter.publishedAt}
</span>
```

**Lines 98-100 — Title:**
```tsx
<h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 tracking-tighter uppercase leading-[1.1]">
```

**Lines 102-106 — Description blockquote:**
```tsx
<div className="border-l border-white/20 pl-6 mb-12">
  <p className="text-lg md:text-xl text-white/50 leading-relaxed">
    {frontmatter.description}
  </p>
</div>
```

**Lines 111-123 — MDX prose container:**
```tsx
<div className="border border-white/5 rounded-none p-8 md:p-16 mb-12 prose prose-invert max-w-none relative">
   <div className="relative z-10">
```
Delete the two gradient blur divs. Remove `prose-cyan`, `shadow-2xl`, `backdrop-blur-sm`, `bg-background/40`, `rounded-[2rem]`.

**Lines 125-131 — Tags:**
```tsx
<span key={tag} className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.15em] border border-white/10 px-3 py-1 rounded-none hover:border-white/40 hover:text-white/50 transition-all cursor-default">
  #{tag}
</span>
```

**Line 139 — Sidebar card:**
```tsx
<div className="p-8 rounded-none bg-white/[0.02] border border-white/10 relative overflow-hidden group">
```
Delete violet glow div (line 140).

**Lines 142-143 — System Brief header:**
```tsx
<h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-6">
  // System Brief
</h4>
```
Remove Sparkles icon.

**Lines 147-153 — Numbered items:**
- `text-cyan-500` and `text-violet-500` → `text-white/60`
- `text-slate-400` → `text-white/40`

**Lines 157-162 — Join Discussion CTA:**
```tsx
<div className="p-6 rounded-none bg-white/[0.02] border border-white/10 text-center">
  <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Join the Discussion</p>
  <Button asChild size="sm" className="w-full bg-white text-black font-bold rounded-none transition-all hover:bg-white/90">
    <Link href="/community">Community Hub</Link>
  </Button>
</div>
```

**Clean up imports:** Remove `Sparkles`, `FlaskConical`, `Clock` if unused.

### Step 2: `components/mdx-content.tsx` — Full rewrite

```tsx
import * as React from "react";

interface MDXContentProps {
  children: React.ReactNode;
}

export function MDXContent({ children }: MDXContentProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:tracking-tighter prose-headings:uppercase prose-headings:text-white prose-p:text-white/60 prose-p:leading-relaxed prose-strong:text-white prose-a:text-white/80 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-white prose-blockquote:border-white/20 prose-blockquote:text-white/50 prose-code:text-white/70 prose-hr:border-white/10">
      {children}
    </div>
  );
}
```

---

## Task 3: Community Hub

**Files:**
- Modify: `app/community/page.tsx`
- Modify: `components/social/community-hub.tsx`

### Step 1: `app/community/page.tsx` — Delete violet/cyan blur divs (lines 39-42).

### Step 2: `components/social/community-hub.tsx` — Full monochrome

**Line 44 — Badge:**
```tsx
<span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
  // Global Network
</span>
```
Remove Globe icon.

**Line 48 — Title:**
```tsx
<h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter uppercase">
  Community Hub
</h1>
```

**Line 51 — Description:** `text-slate-400` → `text-white/40`, `text-lg md:text-xl` → `text-base`

**Lines 60-63 — CTA button:**
```tsx
<Button className="h-12 px-8 bg-white text-black font-bold rounded-none transition-all hover:bg-white/90 text-[10px] uppercase tracking-[0.2em]">
  Initialize Discussion
</Button>
```
Remove Plus icon, glow shadow, rounded-full, hover:scale.

**Lines 71-78 — Section header:**
Remove TrendingUp icon. Filter buttons: active = `text-white/60 bg-white/5`, inactive = `text-white/30 hover:text-white/60`.

**Line 98 — Thread cards:**
```tsx
<Card className="bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group rounded-none overflow-hidden relative">
```
Delete violet glow div (line 99).

**Lines 103 — Title hover:** Remove `group-hover:text-cyan-400`, use `group-hover:text-white`.

**Lines 106-110 — Author:** `text-violet-400` → `text-white/60`. `text-slate-500` → `text-white/30`.

**Lines 112-115 — Comment count:**
```tsx
<div className="flex items-center gap-2 text-white/50 border border-white/10 px-3 py-1.5 rounded-none text-[10px] font-mono">
```

**Line 133 — Stats card:**
```tsx
<Card className="bg-white/[0.02] border border-white/10 rounded-none overflow-hidden relative group">
```
Delete violet glow div.

**Lines 136-138 — Stats title:** `text-violet-400` → `text-white/40`. Delete Zap icon.

**Lines 142-153 — Stats values:** All colored text → `text-white`. Remove `animate-pulse`. `text-slate-400` → `text-white/40`.

**Line 162:** `rounded-[2.5rem]` → `rounded-none`

**Lines 165-169:** `text-cyan-400` → `text-white/40`. Delete ping dot div.

**Line 171:** `text-slate-400` → `text-white/40`

**Lines 182-184:** `text-slate-500` → `text-white/20`. Remove Shield icon.

---

## Task 4: Thread View

**Files:**
- Modify: `app/community/[threadId]/page.tsx` — Delete blur divs
- Modify: `components/social/thread-view.tsx`

### `thread-view.tsx`:

**Lines 31-33 — Badge:**
```tsx
<span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
  // Transmission {threadId}
</span>
```

**Line 35 — Title:** `font-black` → `font-serif font-bold tracking-tighter uppercase`

**Lines 39-41:** `text-violet-400` → `text-white/50`

---

## Task 5: Comment Section

**Files:**
- Modify: `components/social/comment-section.tsx`

**Global replacements:**
- `text-gold` → `text-white`
- `border-gold/20` → `border-white/10`
- `bg-gold` → `bg-white`
- `hover:bg-gold/80` → `hover:bg-white/90`
- `hover:text-gold` → `hover:text-white`
- `focus-visible:ring-gold` → `focus-visible:ring-white/50`
- `rounded-lg` → `rounded-none`
- `rounded-xl` → `rounded-none`
- `shadow-[0_0_15px_rgba(255,215,0,0.05)]` → (delete)
- `border-gold text-gold hover:bg-gold hover:text-black` → `border-white/20 text-white hover:bg-white hover:text-black`
- `bg-background text-gold` (avatar fallback) → `bg-white/5 text-white/60`

---

## Task 6: Auth Pages

**Files:**
- Modify: `app/auth/signin/page.tsx`
- Modify: `app/auth/signup/page.tsx`

### Both files:

**Delete background blur divs.**

**Card:** Add `rounded-none` if not present.

**Title:** Change to `font-serif font-bold tracking-tighter uppercase`.
- Signin: "Sign In" → "Access"
- Signup: "Create an Account" → "Join the Void"

**Description:** `text-muted-foreground` → `text-white/40`

**Warning notice:** Kill amber:
```tsx
<div className="rounded-none border border-white/10 bg-white/[0.02] p-3 text-sm text-white/50">
  <p className="flex items-center gap-2">
    <span className="h-1 w-1 bg-white/40" />
```

**CardFooter:** `border-white/10 bg-white/5` → `border-white/5 bg-white/[0.02]`

**Signup submit button:**
```tsx
<Button className="w-full bg-white text-black hover:bg-white/90 font-bold rounded-none text-[10px] uppercase tracking-[0.2em]" disabled>
```

**Signup labels:** Add `font-mono text-[10px] uppercase tracking-[0.15em]` to label elements.

---

## Task 7: Footer

**Files:**
- Modify: `components/footer.tsx`

**Lines 11-15 — Kill gradient:**
```tsx
<span className="text-white group-hover:opacity-80 transition-opacity">
  Quanim
</span>
```

**Line 20:** `text-muted-foreground` → `text-white/30`

**Lines 30-37:** `text-muted-foreground` → `text-white/30`

---

## Task 8: Lab Simulation Chrome

**Files:**
- Modify: `components/simulations/lab-container.tsx`
- Modify: `components/simulations/lab-interface.tsx`

### `lab-container.tsx`:

**Line 34 — Card:**
```
"relative w-full aspect-video overflow-hidden bg-black border border-white/10 group rounded-none"
```

**Line 38:** `from-slate-950/90` → `from-black/90`

**Lines 40-42 — Title:** `text-amber-500` → `text-white`. Status dot: `bg-amber-500 animate-pulse` → `bg-white/60`

**Line 45-47:** `text-slate-400` → `text-white/40`

**Lines 57-68 — Buttons:** `hover:text-amber-500 hover:bg-amber-500/10` → `hover:text-white hover:bg-white/10`

**Line 74 — Sidebar:** `bg-slate-900/60 border-slate-800/50 rounded-xl` → `bg-black/80 border-white/10 rounded-none`

**Line 83 — Bottom controls:** `bg-slate-900/80 border-slate-800 rounded-full` → `bg-black/80 border-white/10 rounded-none`

**Lines 91-96 — Loader:** `bg-slate-950` → `bg-black`, `text-amber-500` → `text-white/60`

**Lines 125-131 — Status badges:** Kill amber/blue, use `border-white/10 text-white/40 rounded-none`

### `lab-interface.tsx`:

**All button colors:**
- `bg-amber-500 text-slate-950 hover:bg-amber-400` → `bg-white text-black hover:bg-white/90`
- `bg-blue-500 text-white hover:bg-blue-400` → `bg-white text-black hover:bg-white/90`
- `bg-pink-500 text-white hover:bg-pink-400` → `bg-white/80 text-black hover:bg-white/90`
- `bg-slate-800 text-slate-500 cursor-not-allowed` → `bg-white/5 text-white/20 cursor-not-allowed`
- All `rounded-full` in buttons → `rounded-none`
- `bg-slate-700` separators → `bg-white/10`

**Sidebar controls:**
- `text-slate-400` → `text-white/40`
- `text-amber-500` → `text-white/60`
- `bg-slate-800` → `bg-white/10`
- `accent-amber-500` → `accent-white`
- `bg-slate-900/50` → `bg-white/[0.03]`
- `border-slate-800/50` → `border-white/10`
- `rounded-lg` → `rounded-none`
- `bg-blue-500 shadow-[...]` → `bg-white/60`
- `bg-orange-500 shadow-[...]` → `bg-white/40`
- `text-amber-500 bg-black/30` → `text-white/80 bg-white/[0.03]`

---

## Task 9: MDX Content Files

**Files:**
- Modify: `content/topics/double-slit.mdx`
- Modify: `content/topics/superposition.mdx`
- Modify: `content/topics/entanglement.mdx`

### Remove ALL emojis from headings:

**double-slit.mdx:**
- `# 🌊 Double-Slit Experiment` → `# Double-Slit Experiment`
- `### 🔬 Historical Significance` → `### Historical Significance`
- `### 🌊 What You're Seeing` → `### What You're Seeing`
- `### 🤯 The Quantum Mystery` → `### The Quantum Mystery`
- Equation box: `text-amber-500` → `text-white`, `bg-slate-900/50 border border-slate-800 rounded-lg` → `bg-white/[0.03] border border-white/10 rounded-none`, `text-slate-400` → `text-white/40`

**superposition.mdx:**
- `# ⚛️ Quantum Superposition` → `# Quantum Superposition`
- `### 🐱 Schrödinger's Cat` → `### Schrodinger's Cat`
- `### 🎲 The Measurement Problem` → `### The Measurement Problem`
- `### ⚛️ What You're Seeing` → `### What You're Seeing`
- `### 🔮 Applications of Superposition` → `### Applications of Superposition`
- Quote box: `bg-slate-900/50 border-l-4 border-amber-500 rounded-r-lg` → `border-l border-white/20`, `text-slate-400` → `text-white/40`
- App cards: `bg-slate-900/50 border border-slate-800 rounded-xl` → `bg-white/[0.03] border border-white/10 rounded-none`, `text-amber-500` → `text-white`, `text-slate-400` → `text-white/40`

**entanglement.mdx:**
- Delete emoji divs (`🔐`, `💻`, `📡`)
- App cards: `bg-slate-900/50 rounded-xl border border-slate-800` → `bg-white/[0.03] rounded-none border border-white/10`, `text-slate-100` → `text-white`, `text-slate-400` → `text-white/40`

---

## Verification Plan

### Build Check
```bash
npm run build
```
Must exit with code 0.

### Grep for Banned Patterns
```powershell
# From project root — each should return 0 results
rg "cyan-" --include "*.tsx" --include "*.mdx" -l app/ components/ content/
rg "violet-" --include "*.tsx" --include "*.mdx" -l app/ components/ content/
rg "emerald-" --include "*.tsx" --include "*.mdx" -l app/ components/ content/
rg "text-gold" --include "*.tsx" -l app/ components/
rg "amber-" --include "*.tsx" --include "*.mdx" -l app/ components/ content/
```

### Visual Verification (Browser at localhost:8080)
1. `/topics` — Monochrome cards, no colored badges
2. `/topics/double-slit` — White prose, no emojis, monochrome lab
3. `/community` — No cyan/violet, sharp cards
4. `/community/t1` — Monochrome thread view
5. `/auth/signin` — Stark monochrome form
6. `/auth/signup` — Stark monochrome form
7. Every footer — No gradient on "Quanim"
