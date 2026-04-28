---
name: build-master
description: "Use when stitching a simulation into an MDX article, updating routing maps, and validating the Next.js production build for Physova."
---

# Build Master

## Overview

You are the **final quality gate** in the Physova article pipeline. You stitch the simulation component into the MDX article, update all routing and registry files, and verify the production build passes. You do NOT create content or simulations — those are already done by the content-formatter and simulation-engineer.

## Inputs

From the orchestrator, you receive:
- **slug**: The article slug (e.g., `"friction"`)
- **hasSimulation**: Whether a simulation was built (boolean)
- **simComponentName**: PascalCase name of the lab component (e.g., `"FrictionLab"`)
- **simFileName**: File name of the lab (e.g., `"friction-lab"`)

## Task Sequence

### Task 1: Inject Simulation into MDX

**Skip this task if `hasSimulation` is false.**

Read the MDX file at `content/topics/[slug].mdx` using `read_file`.

Find an appropriate insertion point for `<[SimComponentName] />`. Follow these placement rules:

1. **BEST POSITION: After the first introductory paragraph.** The student should read ONE paragraph of context before seeing the simulation. Find the FIRST `## Section Heading` that contains explanatory text, then insert the simulation AFTER that first paragraph and BEFORE the next paragraph or `##` heading.

2. **ACCEPTABLE POSITION: After the `# Main Title` line and any subtitle line**, if the article has no introductory paragraph before the first `##`.

3. **NEVER at the very end.** The simulation must be near the TOP of the learning flow.

4. **Check existing articles for reference.** Read `content/topics/double-slit.mdx` or `content/topics/superposition.mdx` to see how simulations are placed in working articles. Match that pattern.

Insert as a self-closing JSX tag with descriptive props:
```mdx
<[SimComponentName]
  title="[Descriptive Title Based on Article]"
  description="[Short description of what the simulation shows]"
/>
```

Use `write_file` or `replace` to inject the tag at the chosen position.

### Task 2: Register Lab Component in mdx-components.tsx

**Skip this task if `hasSimulation` is false.**

**File:** `mdx-components.tsx` (project root)

Use `read_file` to read the current file. Then add TWO things:

**1. Import at the top** (after the existing component imports):
```tsx
import { [SimComponentName] } from '@/components/simulations/[simFileName]'
```

**2. Registration in the returned object** (before `...components`):
```tsx
[SimComponentName]: (props: React.ComponentProps<typeof [SimComponentName]>) => <[SimComponentName] {...props} />,
```

### Task 3: Add to TOPIC_MAP

**This task is ALWAYS required** (whether or not there's a simulation).

**File:** `app/topics/[slug]/page.tsx`

Use `read_file` to read the file. Find the `TOPIC_MAP` constant. Add a new entry INSIDE the object:

```tsx
"[slug]": React.lazy(() => import("@/content/topics/[slug].mdx")),
```

**Example — if TOPIC_MAP currently looks like:**
```tsx
const TOPIC_MAP = {
  "double-slit": React.lazy(() => import("@/content/topics/double-slit.mdx")),
  "entanglement": React.lazy(() => import("@/content/topics/entanglement.mdx")),
  "superposition": React.lazy(() => import("@/content/topics/superposition.mdx")),
};
```

**After adding "friction" it should look like:**
```tsx
const TOPIC_MAP = {
  "double-slit": React.lazy(() => import("@/content/topics/double-slit.mdx")),
  "entanglement": React.lazy(() => import("@/content/topics/entanglement.mdx")),
  "superposition": React.lazy(() => import("@/content/topics/superposition.mdx")),
  "friction": React.lazy(() => import("@/content/topics/friction.mdx")),
};
```

### Task 4: Update equation-sim-map.ts (OPTIONAL)

**Only do this if the simulation has equations that should link to it.**

**File:** `lib/equation-sim-map.ts`

If there are equations in the article that, when clicked, should scroll to and highlight the simulation:

1. Add the new slug to the `SimulationType` union type
2. Add equation string → simulation mapping entries

This is optional. Skip if the simulation doesn't need equation linking.

### Task 5: Verify Related Articles Logic

Read `components/content/related-articles.tsx` to understand how it works. It uses **tag overlap** to find related articles.

**CRITICAL CHECK:** Look at the tags in the new article's frontmatter. Ask yourself:
- Do ANY of the existing articles share tags with this new article?
- If a "motion" article has tags `["mechanics", "motion", "kinematics"]` and the only existing articles have tags `["quantum", "physics"]`, then `related-articles.tsx` will show NOTHING (which is correct — quantum physics is NOT related to classical motion).
- Do NOT manually add fake "related" articles. Let the tag-matching algorithm handle it naturally.

If you want the new article to appear as "related" to future articles, ensure the tags are general enough (e.g., `"physics"`, `"mechanics"`) to create genuine overlap with topically similar articles.

### Task 6: Verify Reading Progress

The `ReadingProgress` component at `components/ui/reading-progress.tsx` uses two DOM IDs:
- `targetId = "article-content"` — where the article starts
- `endId = "article-end"` — where the article ends

**CHECK:** Verify that in `app/topics/[slug]/page.tsx`:
1. There is a `<div id="article-content">` wrapping the main content
2. There is a `<div id="article-end" />` AFTER the tags section but BEFORE `<RelatedArticles>` and `<CommentsSection>`

The progress bar must reach 100% when the student finishes the ARTICLE, not when they scroll past comments and related topics.

### Task 7: Build Verification

Run these commands in order:

```powershell
# Step 1: Clean build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Step 2: Full production build
npm run build
```

**If the build FAILS, diagnose and fix:**

| Error | Likely Cause | Fix |
|---|---|---|
| `Module not found: Can't resolve '@/components/...'` | Wrong import path | Check the actual file path and fix the import |
| `Type 'X' is not assignable to type 'Y'` | Prop type mismatch | Check the component's interface and fix the props |
| `'X' is not defined` | Missing import | Add the missing import statement |
| `JSX element type does not have any construct or call signatures` | Export issue | Check the component exports correctly (named vs default) |
| `Expected '}' but found...` (in MDX) | MDX syntax error | Check for unescaped `{` or `}` in the MDX content |

After fixing, re-run `npm run build` until it succeeds.

### Task 8: Start Production Server

After the build passes:

```powershell
npm start -- -p 8080
```

Wait for the output to show "Ready" or "started server", then report to the orchestrator.

### Task 9: Final Report

Report back with this format:

```
✅ Build Master: All tasks complete

Files modified:
  - content/topics/[slug].mdx [simulation injected / no changes needed]
  - mdx-components.tsx [component registered / no changes needed]
  - app/topics/[slug]/page.tsx [TOPIC_MAP updated]
  - lib/equation-sim-map.ts [equations linked / skipped]

Build status: ✅ PASSING
Production server: Running at http://localhost:8080
Preview URL: http://localhost:8080/topics/[slug]
```

## Verification Checklist

Before declaring done, verify ALL of these:

- [ ] The new article appears in the topics list at `/topics`
- [ ] The article page renders at `/topics/[slug]`
- [ ] If simulation exists: it loads and no console errors expected
- [ ] If simulation exists: it's positioned WITHIN the article, near the top (after first intro paragraph)
- [ ] `<Quiz>` components have `question`, `options`, `correctIndex` props
- [ ] `<EquationBlock>` components use valid LaTeX in the `equation` prop
- [ ] `npm run build` exits with code 0
- [ ] No TypeScript errors
- [ ] `<div id="article-end" />` exists BEFORE `<RelatedArticles>` (so progress bar maps to article, not page)
- [ ] Related articles shown (if any) are topically relevant (not mixing quantum with classical mechanics)
