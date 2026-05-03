# Physova v3 — The Production Era

Physova is a high-fidelity, interactive physics education and community platform. It combines cinematic 3D narratives with hands-on physics laboratories to create an immersive learning experience for students and researchers.

## 🚀 What's New in v3
Physova v3 represents a complete architectural overhaul from the original Quanim beta.

### Core Enhancements
- **Recursive Community Hub**: Deeply threaded, Reddit-style discussions with real-time moderation tools.
- **Interactive Lab Container**: A unified 3D simulation environment with state-sharing capabilities.
- **Smart Content Pipeline**: Automated MDX-to-Interactive-Lab conversion via the Gemini CLI.
- **Production-Grade Auth**: Secure NextAuth v5 integration with Google, GitHub, and email visibility toggles.
- **Automated Communication**: Integrated Resend engine for stylized student onboarding.
- **Security & Performance**: Hardened Supabase RLS policies and Vercel Analytics integration.

## ✨ v3.1 Visual Polish & Feedback Fixes
Based on comprehensive feedback (v3.1 Implementation Plan), we've refined the platform's aesthetics and interaction model.

### Design & Typography
- **Switzer Font Migration**: Replaced Geist Sans with Switzer (sans-serif) across the entire platform for a more sophisticated, editorial feel.
- **Unified Font System**: Playfair Display for headers, Switzer for UI/Body, and JetBrains Mono for data/cipher elements.
- **Baseline Alignment**: Fixed "Grade 9" and other old-style numeral alignment issues in topics index.
- **Monochrome Depth**: Added subtle grey gradients and borders to the Topics page for improved visual hierarchy.

### Cinematic 3D Scene
- **Black Hole Refinement**: Removed the photon ring and background glow circle for a cleaner, more realistic gravitational void.
- **Spaceship Choreography**: Spaceship now appears only after Stage 3 bento cards fade out, preventing visual overlap.
- **Transition Logic**: Improved spaceship-to-sun transition with independent fade ranges and camera choreography to prevent overlaps.
- **Earth Texture Fix**: Removed polar cap artifacts and seam lines.

### UI & Interaction
- **Navbar Refinement**: Increased contrast, font size, and tightened logo letter-spacing for better readability.
- **Mobile Navigation Fix**: Resolved issue where the hamburger menu couldn't be closed; integrated Radix UI `SheetTrigger`.
- **Bento Card Equalization**: Enforced consistent sizing for module cards on the landing page.
- **Interaction Fixes**: Restored clickability to Phase 3 modules by correcting pointer-event layering.

## 📝 For Authors (Singerboy & Partners)
If you are writing content for Physova, we have created a dedicated, step-by-step guide to help you publish without touching any code.

👉 **[READ THE WRITING GUIDE](WRITING_GUIDE.md)**

This guide explains how to use the **Gemini CLI** to turn your simple `.md` drafts into fully-rendered 3D interactive physics articles.

---

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **3D Engine:** React Three Fiber (Three.js)
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js
- **Emails:** Resend
- **Analytics:** Vercel Analytics

## 📂 Project Structure
- `/app`: Application routes and layout.
- `/components`: UI library and 3D simulations.
- `/content/topics`: Published physics articles (MDX).
- `/content/drafts`: Author drafts awaiting publication.
- `/scripts`: Database and maintenance utilities.

---

**Version:** 3.1.0
**Project Owner:** Shubhadeep Roy
**Technical Orchestrator:** Antigravity AI
