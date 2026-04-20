# Quanim v2 — Physics Reimagined

Quanim is a high-fidelity, interactive physics education and community platform. It combines cinematic 3D narratives with hands-on quantum simulations to create an immersive learning experience.

## 🌌 Project Overview

Quanim v2 is built for stability, performance, and visual impact. It utilizes a state-of-the-art tech stack to deliver smooth physics simulations directly in the browser.

### Core Features
- **Cinematic Hero:** A scroll-driven 3D journey through the Singularity, Classical Mechanics, and Stellar Physics.
- **Quantum Labs:** Interactive simulations for the Double-Slit experiment, Quantum Entanglement, and Wavefunction Superposition.
- **MDX Articles:** Rich, editorial-style physics topics with integrated math and live labs.
- **Community Hub:** A space for discussion, questions, and networking among physics enthusiasts.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui (Minimalist Monochrome)
- **3D Engine:** React Three Fiber (Three.js)
- **Animations:** Framer Motion
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** NextAuth.js (v5 Beta)
- **Content:** MDX (Markdown + React Components)

---

## 📝 Content Management (For Clients)

Quanim uses a "Content-as-Code" approach, allowing you to publish new physics topics simply by writing Markdown files.

### Where to write
All articles are located in the `content/topics/` directory.

### Adding a New Topic
1. Create a new file ending in `.mdx` (e.g., `quantum-gravity.mdx`).
2. Add the **Frontmatter** at the top (the metadata between `---` lines).
3. Write your content using standard Markdown.
4. **Important:** You can embed the interactive Lab by adding the `<Lab />` component.

#### Example File Structure:
```markdown
---
title: "Quantum Gravity"
slug: "quantum-gravity"
description: "Bridging the gap between the very big and the very small."
tags: ["quantum", "gravity", "black-holes"]
publishedAt: "2026-04-20"
difficulty: "Advanced"
---

# Quantum Gravity

Your article text goes here...

<Lab 
  type="superposition" 
  title="Gravity Lab" 
  description="Explore gravitational wave superposition."
/>

### Key Equations
<div className="equation-box p-6 bg-white/[0.03] border border-white/10 text-center font-serif">
  <div className="equation text-2xl text-white">Rμν - ½Rgμν = 8πG Tμν</div>
</div>
```

### Editing Topics
Simply open the `.mdx` file in the `content/topics/` folder, make your changes, and save. The website will automatically update (using ISR) or update on the next build.

---

## 🚀 Getting Started

### Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Setup:**
   Create a `.env` file with your DATABASE_URL and AUTH_SECRET.
3. **Run the dev server:**
   ```bash
   npm run dev
   ```
4. **Access:** Open [http://localhost:3000](http://localhost:3000).

### Production Build
To prepare the site for a client or deployment:
```bash
npm run build
```

---

## 📂 Project Structure
- `/app`: Main page routes and UI logic.
- `/components`: Reusable UI elements and 3D simulations.
- `/content/topics`: **(Edit here)** Markdown files for physics articles.
- `/public`: Static assets (favicon, images).
- `/docs`: Implementation plans and reference materials.
- `/del`: Redundant files moved here for manual deletion.

**Version:** 2.0.4-BETA
**Signed off by:** Maestro Orchestrator
