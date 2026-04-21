# Physova Cleanup Design

## Objectives
Cleanup session for production readiness. Focus on stability, performance, and UX polishing.

## 1. Stability & Build Fixes
- **npm run build:** Fix ESLint errors preventing production compilation.
    - **app/auth/signin/page.tsx:** Escape unescaped entities (`'` -> `&apos;`).
    - **app/topics/[slug]/page.tsx:** Remove unused `Lab` and `simType`.
    - **components/footer.tsx:** Remove unused icons (`Github`, `Twitter`, `MessageSquare`).
    - **components/simulations/double-slit-sim.tsx:** Remove unused `Text` and `delta`.
    - **components/simulations/entanglement-sim.tsx:** Replace `any` types with proper interfaces or `unknown`.
    - **social/community-hub.tsx, thread-view.tsx, topics-list.tsx:** Fix JSX comment node warnings (comments inside braces `{/* ... */}`).
- **Next.js Config:** Migrate `experimental.turbo` -> `config.turbopack`.
- **ESLint Config:** Migrate `.eslintignore` logic into `eslint.config.mjs` ("ignores" property).

## 2. User Experience (UX)
- **Split Screen Exit:**
    - Add a floating 'Exit' button (overlay) in the corner of the split pane.
    - Implement `Esc` key listener to exit split screen mode.
- **Fullscreen Simulation:**
    - Reposition main simulation buttons to the left sidebar (below tweaks) when in fullscreen mode.
    - Ensure unified control layout on the left for fullscreen focus.

## 3. Visuals & Performance
- **Blackhole Simulation:**
    - Reduce particle count from current amount to 2,500.
    - Adjust particle distribution (respacing) to maintain visual impact while improving performance.
- **Background Grain:**
    - Add an SVG noise filter overlay to the main background (`pure black` -> textured dark).
    - Targeting ~2-3% opacity (adjust for visible but subtle grain).

## 4. Implementation Constraints
- **Shell:** Powershell only (no `&&`).
- **Tools:** Use `debugger` for ESLint/Build issues; `coder` for feature updates; `ux_designer` for layout/grain.
- **Order:** Fix visual/feature issues FIRST, then build debugs.

## 5. Success Criteria
- `npm run build` succeeds without ESLint or config errors.
- Split screen is exit-able via UI and Keyboard.
- Fullscreen controls are accessible on the left.
- Background has subtle grain texture.
- Particle performance is optimized for production.
