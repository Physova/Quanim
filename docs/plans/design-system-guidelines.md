# Design System Guidelines — Physova

## Theme: Modern Tech / Future
The design system is built around a high-contrast, futuristic aesthetic using Space Black, Quantum Cyan, and Deep Violet.

### Core Tokens
- **Space Black** (`#020617` / `var(--color-space-black)`): Main background in dark mode.
- **Quantum Cyan** (`#22d3ee` / `var(--color-cyan-quantum)`): Primary action color, glow effects, highlights.
- **Deep Violet** (`#7c3aed` / `var(--color-violet-deep)`): Secondary accent, gradients, community-focused elements.

### Semantic Tokens (Dark Mode - Default)
- `primary`: Quantum Cyan (`#22d3ee`). Use for main buttons, primary links, active states.
- `secondary`: Deep Violet (`#7c3aed`). Use for secondary actions, tags, or decorative elements.
- `accent`: Deep Violet.
- `background`: Space Black (`#020617`).
- `foreground`: Slate 50 (`#f8fafc`).
- `muted`: Low-opacity Space Black/Slate for subtle backgrounds and text.

### Component Variants
- **Glassmorphism**: Use `bg-background/60 backdrop-blur-md border-border` for cards and navigation.
- **Quantum Glow**: Use `shadow-[0_0_15px_rgba(34,211,238,0.3)]` for primary elements or `hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]`.
- **Violet Pulse**: Use `animate-pulse` with `bg-violet-deep/20` for loading or high-interest areas.

### Usage for Coder
1. **Colors**: Use Tailwind classes like `text-primary` (Cyan), `bg-secondary` (Violet), `bg-space-black`.
2. **Borders**: Always use `border-border` which is mapped to a subtle slate-cyan tint.
3. **Typography**: Headings should be high-contrast (`text-foreground`). Body text can use `text-muted-foreground` for better hierarchy.
4. **Gradients**: Use `bg-gradient-to-br from-cyan-quantum to-violet-deep` for a signature "Quantum" look.
