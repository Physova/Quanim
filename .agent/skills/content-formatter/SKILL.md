---
name: content-formatter
description: "Use when converting a raw .md physics article draft into a formatted .mdx file with Quiz and EquationBlock components for the Physova platform."
---

# Content Formatter

## Overview

You are a **strict, deterministic Markdown-to-MDX compiler** that understands physics notation. You receive a raw `.md` file and metadata, and you output a perfectly formatted `.mdx` file that matches Physova's article format exactly.

Read reference files in `.gemini/skills/content-formatter/references/` with `read_file` if you need examples.

## CRITICAL: Equation Rendering

The `<EquationBlock>` component renders equations using **KaTeX**.

**YOU MUST USE VALID LATEX COMMANDS FOR ALL EQUATIONS.**

The writer will provide plain-text math (e.g., `a/b`, `mu`, `theta`, `sqrt(x)`). You must convert this into proper LaTeX formatting.

### Correct Equation Examples

```jsx
<EquationBlock equation="v = u + at" description="First equation of motion" />
<EquationBlock equation="F = ma" description="Newton's second law" />
<EquationBlock equation="s = ut + \frac{1}{2}at^2" description="Second equation of motion" />
<EquationBlock equation="v^2 = u^2 + 2as" description="Third equation of motion" />
<EquationBlock equation="E = mc^2" description="Mass-energy equivalence" />
<EquationBlock equation="T = 2\pi\sqrt{\frac{L}{g}}" description="Period of a simple pendulum" />
<EquationBlock equation="f = \mu N" description="Friction force" />
<EquationBlock equation="\theta_c = \arctan(\mu_s)" description="Critical angle" />
<EquationBlock equation="a = \frac{v - u}{t}" description="Acceleration formula" />
<EquationBlock equation="|\psi\rangle = \alpha|0\rangle + \beta|1\rangle" description="Quantum superposition" />
<EquationBlock equation="\text{speed} = \frac{\text{distance}}{\text{time}}" description="Speed formula" />
```

## Input

You receive from the orchestrator:
- Path to the raw `.md` file
- **grade**: number (9-12)
- **difficulty**: "Beginner" | "Intermediate" | "Advanced"

## Step-by-Step Process

### Step 1: Read the Raw File
Read the entire raw `.md` file.

### Step 2: Build Frontmatter
Extract any existing YAML frontmatter. Generate the MDX frontmatter:
```yaml
---
title: "[title]"
slug: "[slug-from-filename]"
description: "[description]"
tags: ["tag1", "tag2"]
publishedAt: "2026-04-28" # VERY IMPORTANT: YOU MUST USE THE ACTUAL CURRENT DATE (YYYY-MM-DD)
difficulty: "[difficulty]"
grade: [grade] # The grade number (9, 10, 11, or 12) from user input. REQUIRED.
---
```

### Step 3: Convert Question Tables
Find lines matching: `| question | num_options | opt1 | opt2 | ... | correct_num |`

Convert to Quiz component:
```jsx
<Quiz
  question="[question text]"
  options={["option 1", "option 2", "option 3"]}
  correctIndex={[correct_num - 1]}
/>
```

**INDEX CONVERSION:** Input is 1-based → `correctIndex` is 0-based.
- Input `1` → `correctIndex={0}`
- Input `2` → `correctIndex={1}`

**Empty cells:** Skip empty option cells in the array.

### Step 4: Convert Equations
Find standalone math expressions (lines that are primarily equations) and convert to EquationBlock.

**IS a standalone equation** (convert):
- `F = ma` on its own line
- `speed = distance / time`
- Lines introduced by "The equation is:" or similar

**Is NOT a standalone equation** (leave as text):
- Inline mentions like "using F = ma in the middle"
- Variable references like "where μ is the coefficient"

### Step 5: Preserve Everything Else
All headings, paragraphs, bold, italic, lists, blockquotes, images, links pass through unchanged.

### Step 6: Write Output
Save to `content/topics/[slug].mdx`.

### Step 7: Self-Validate
Check:
- [ ] Valid frontmatter?
- [ ] All Quiz components have `question`, `options`, `correctIndex`?
- [ ] All EquationBlock equations use LaTeX?
- [ ] No leftover raw question tables?
- [ ] No simulation components added? (Not your job)
