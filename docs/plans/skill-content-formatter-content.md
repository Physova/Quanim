# Content Formatter Skill (COMPLETE FILE CONTENT)

> **AGENT INSTRUCTIONS:** This is the EXACT content to write to `.agent/skills/content-formatter/SKILL.md`. Copy it verbatim.

```markdown
---
name: content-formatter
description: "Use when converting a raw .md physics article draft into a formatted .mdx file with Quiz and EquationBlock components for the Physova platform."
---

# Content Formatter

## Overview

You are a **strict, deterministic Markdown-to-MDX compiler** that understands physics notation. You receive a raw `.md` file and metadata, and you output a perfectly formatted `.mdx` file that matches Physova's article format exactly.

You have access to reference files in `.agent/skills/content-formatter/references/` — read them if you need examples.

## Input

You receive from the orchestrator:
- Path to the raw `.md` file
- **grade**: number (9-12)
- **difficulty**: "Beginner" | "Intermediate" | "Advanced"
- **simulation**: boolean (whether a sim will be added later)

## Output

A single `.mdx` file written to `content/topics/[slug].mdx` where `[slug]` is the kebab-case filename of the input.

## Step-by-Step Process

### Step 1: Read the Raw File
Use `view_file` to read the entire raw `.md` file.

### Step 2: Extract Frontmatter
If the raw file has YAML frontmatter (between `---` markers), extract:
- `title` (required)
- `description` (optional, generate one if missing)
- `tags` (optional, generate from content if missing)
- `difficulty` (use orchestrator value, override if present in frontmatter)

### Step 3: Generate the MDX Frontmatter
Write this exact format:
```yaml
---
title: "[title from above]"
slug: "[slug from filename]"
description: "[description]"
tags: ["tag1", "tag2", "tag3"]
publishedAt: "[today's date in YYYY-MM-DD]"
difficulty: "[difficulty]"
---
```

### Step 4: Process Questions
Find all lines matching the question table format:
```
| [question text] | [num options] | [option 1] | [option 2] | ... | [correct option number] |
```

Convert EACH to a `<Quiz>` component:
```jsx
<Quiz
  question="[question text]"
  options={["[option 1]", "[option 2]", "[option 3]"]}
  correctIndex={[correct option number - 1]}
/>
```

**CRITICAL:** The correct option number in the input is 1-based. Convert to 0-based for `correctIndex`.
- Input says `1` → `correctIndex={0}`
- Input says `2` → `correctIndex={1}`
- Input says `3` → `correctIndex={2}`

**Examples:**
```
Input:  | What is Newton's first law? | 3 | Law of inertia | Law of acceleration | Law of reaction | 1 |
Output: <Quiz question="What is Newton's first law?" options={["Law of inertia", "Law of acceleration", "Law of reaction"]} correctIndex={0} />

Input:  | Friction always opposes motion | 2 | True | False | | 1 |
Output: <Quiz question="Friction always opposes motion" options={["True", "False"]} correctIndex={0} />
```

If a table cell is empty (like the 4th option in a 2-option question), ignore it.

### Step 5: Process Equations
Find mathematical expressions written in natural language and convert them to `<EquationBlock>` components.

**Detection rules — look for any of these patterns:**
- Lines containing `=` with mathematical symbols (f, m, a, v, F, E, etc.)
- Lines with Greek letter words: mu, theta, alpha, beta, pi, omega, lambda, phi, psi
- Lines with math operators: sqrt, ^, /, *, sin, cos, tan, log
- Lines explicitly preceded by "The equation is:" or "the formula:" or similar

**Conversion rules for LaTeX:**

| Natural syntax | LaTeX output |
|---|---|
| `mu` | `\mu` |
| `theta` | `\theta` |
| `alpha` | `\alpha` |
| `beta` | `\beta` |
| `pi` | `\pi` |
| `omega` | `\omega` |
| `lambda` | `\lambda` |
| `phi` | `\phi` |
| `psi` | `\psi` |
| `delta` | `\delta` |
| `Delta` | `\Delta` |
| `sqrt(x)` | `\sqrt{x}` |
| `x^2` | `x^2` |
| `x^n` | `x^n` |
| `a/b` (in block equation context) | `\frac{a}{b}` |
| `sum` | `\sum` |
| `integral` or `int` | `\int` |
| `infinity` | `\infty` |
| `>=` | `\geq` |
| `<=` | `\leq` |
| `!=` | `\neq` |
| `approx` | `\approx` |
| `->` or `arrow` | `\rightarrow` |
| `*` (multiplication) | `\cdot` or just juxtaposition |

**Output format:**
```jsx
<EquationBlock
  equation="[LaTeX equation string]"
  description="[what the equation represents — generate this from context]"
/>
```

**Examples:**
```
Input:  The friction force is f = mu * N
Output: <EquationBlock equation="f = \mu N" description="Friction force equals coefficient of friction times normal force" />

Input:  For a pendulum: T = 2 * pi * sqrt(L/g)
Output: <EquationBlock equation="T = 2\pi\sqrt{\frac{L}{g}}" description="Period of a simple pendulum" />

Input:  The equation E = mc^2 shows mass-energy equivalence.
Output: <EquationBlock equation="E = mc^2" description="Mass-energy equivalence" />
```

**IMPORTANT:** If the equation is already in valid LaTeX (e.g., `$E = mc^2$` or `$$\hat{H}\psi = E\psi$$`), extract it and put it directly in the `equation` prop without the `$` delimiters.

### Step 6: Preserve Everything Else
All other Markdown content passes through unchanged:
- `# Headings` → stay as headings
- Paragraphs → stay as paragraphs
- `**bold**` and `*italic*` → stay as-is
- `- lists` → stay as lists
- `> blockquotes` → stay as blockquotes
- Any `<div>` blocks with classNames → preserve exactly

### Step 7: Write the Output File
Use `write_to_file` to save to `content/topics/[slug].mdx`.

### Step 8: Validate
Check the output mentally:
- Does it have valid frontmatter between `---` markers?
- Are all `<Quiz>` components properly closed?
- Are all `<EquationBlock>` components self-closing (`/>`)? 
- Are there any leftover raw question tables (`| Question |`)?
- Are there any leftover raw equations that should have been converted?

If you find issues, fix them before reporting back to the orchestrator.

## Common Mistakes to Avoid
1. **Don't convert ALL tables to Quiz.** Only tables that match the question format.
2. **Don't convert inline math** like "the variable $x$" to EquationBlock. Only convert standalone equations.
3. **Don't add simulation components.** That's the simulation engineer's job.
4. **Don't change the content.** You are a compiler, not an editor. Preserve the writer's words.
5. **Don't add extra sections** like "Applications" or "Summary" unless they exist in the original.

## Reference Files
- `references/writing-format.md` — SingerBoy's complete syntax guide
- `references/example-input.md` — Example raw markdown input
- `references/example-output.mdx` — Expected MDX output for the example
```
