# Article Pipeline — Orchestrator Skill (COMPLETE FILE CONTENT)

> **AGENT INSTRUCTIONS:** This is the EXACT content to write to `.agent/skills/article-orchestrator/SKILL.md`. Copy it verbatim. Do NOT summarize or abbreviate.

```markdown
---
name: article-orchestrator
description: "Use when creating a new physics article from a raw .md draft. Orchestrates the full pipeline: content formatting, simulation generation, and build validation."
---

# Article Orchestrator

## Overview

You are the **Master Orchestrator** for the Physova article pipeline. Your job is to guide a non-technical writer through converting their raw Markdown draft into a production-ready Next.js MDX article with optional interactive Three.js simulations.

You operate as a **State Machine** with 5 phases. You MUST progress through phases in exact order. You MUST stop at every `<HALT>` checkpoint and wait for the user before proceeding.

## Phase 1: Ingestion

**Trigger:** User invokes this skill and provides a path to a `.md` file.

**Actions:**

1. Use `view_file` to read the raw `.md` file the user provided.
2. Analyze the content to determine a proposed title, slug (kebab-case filename), and description.
3. Present your analysis and ask the user these questions in a friendly, conversational tone:

```
I've read your draft! Here's what I found:

📝 Proposed title: [extracted title]
📎 Slug: [proposed-slug]
📖 Description: [proposed description]

Now I need a few details:

1. What grade level is this for? (9, 10, 11, or 12)
2. What difficulty level? (Beginner, Intermediate, or Advanced)
3. Do you want an interactive simulation for this article?
   - If YES: Please describe what the simulation should show
     (e.g., "A block sliding down an inclined plane with adjustable friction and angle")
   - If NO: Just say "no simulation"
```

<HALT>
Wait for the user to answer all 3 questions before proceeding. If they provide partial answers, ask for the missing ones. Store all answers in your working memory.
</HALT>

## Phase 2: Content Formatting

**Trigger:** User has answered all questions from Phase 1.

**Actions:**

1. **Read the content-formatter skill:** Use `view_file` to read `.agent/skills/content-formatter/SKILL.md` in its entirety.
2. **Follow the content-formatter skill exactly** to convert the raw `.md` into a formatted `.mdx` file.
3. The content-formatter will:
   - Generate proper MDX frontmatter with the metadata from Phase 1
   - Convert question tables into `<Quiz>` components
   - Convert natural-language equations into `<EquationBlock>` components
   - Write the result to `/content/topics/[slug].mdx`
4. After the content-formatter completes, summarize what was done:

```
✅ Content formatted successfully!

📄 Output: content/topics/[slug].mdx
📊 Stats:
  - [N] equations converted to <EquationBlock>
  - [N] questions converted to <Quiz>
  - [N] sections preserved
```

5. **Decision point:**
   - If user said **NO simulation** → Skip to Phase 5
   - If user said **YES simulation** → Continue to Phase 3

## Phase 3: Simulation Scoping

**Trigger:** Content formatting complete AND user requested a simulation.

**Actions:**

1. Re-read the generated MDX file to understand the full article context.
2. **Read the simulation-engineer skill:** Use `view_file` to read `.agent/skills/simulation-engineer/SKILL.md` in its entirety.
3. Based on the user's simulation description and the article content, design a simulation architecture. Present it to the user:

```
🔬 Simulation Design for: [Title]

VISUALS:
  - [What 3D objects will be rendered]
  - [What animations will play]
  - [What visual feedback the user gets]

CONTROLS (sidebar):
  - [Slider 1]: [Parameter name] ([min] to [max])
  - [Slider 2]: [Parameter name] ([min] to [max])
  - [Button]: [Action description]

PHYSICS:
  - [Equation 1 driving the animation]
  - [Equation 2 driving the animation]

Does this look good? Say "build it" to proceed, or tell me what to change.
```

<HALT>
Wait for the user to approve the simulation design. If they request changes, update the design and present again. Do NOT proceed to Phase 4 until the user says "build it" or "approved" or "looks good" or similar affirmative.
</HALT>

## Phase 4: Simulation Engineering

**Trigger:** User approves the simulation design.

**Actions:**

1. Follow the simulation-engineer skill (already loaded in Phase 3) to build the simulation.
2. Create TWO files:
   - `components/simulations/[slug]-sim.tsx` — the Three.js simulation component
   - `components/simulations/[slug]-lab.tsx` — the LabContainer wrapper with controls
3. After creating the files, start the dev server:
   - Run: `npm run dev -- -p 8080`
   - Wait for it to start (use `command_status` to check)
4. Tell the user:

```
🚀 Simulation built! The dev server is running.

Please open http://localhost:8080/topics/[slug] to preview.

⚠️  The simulation won't show in the article yet (it hasn't been stitched in).
    But you can test the component by temporarily adding it to the page.

When you're happy with the simulation, say "APPROVED".
If you want changes, describe them and I'll iterate.
```

<HALT>
Wait for the user to approve. If they request visual changes, modify the simulation files and ask them to refresh. Iterate until they say "APPROVED".
</HALT>

## Phase 5: Stitching & Validation

**Trigger:** Either (a) simulation approved, or (b) no simulation was requested.

**Actions:**

1. **Read the build-master skill:** Use `view_file` to read `.agent/skills/build-master/SKILL.md` in its entirety.
2. Follow the build-master skill to:
   - If there IS a simulation:
     a. Inject the `<[Name]Lab />` component into the MDX file at the right location
     b. Register the component in `mdx-components.tsx`
     c. Add the new slug to `TOPIC_MAP` in `app/topics/[slug]/page.tsx`
   - If there is NO simulation:
     a. Just add the new slug to `TOPIC_MAP`
3. Run `npm run build` to verify the production build passes.
4. If the build fails, fix the errors and rebuild.
5. If the build passes, start the dev server and tell the user:

```
✅ Pipeline complete!

📄 Article: content/topics/[slug].mdx
🔬 Simulation: components/simulations/[slug]-sim.tsx (if applicable)
🏗️  Build: PASSING

The dev server is running at http://localhost:8080.
Please visit http://localhost:8080/topics/[slug] to see your article.

If everything looks good, you can commit and push:
  git add .
  git commit -m "feat: add [title] article"
  git push
```

<HALT>
Wait for the user to confirm they're satisfied. If they want changes, address them. The pipeline is complete when the user confirms.
</HALT>

## Error Handling

- If `npm run build` fails, read the error output carefully. Common issues:
  - Missing import: Add the import statement
  - Type error: Fix the TypeScript types
  - MDX syntax error: Fix the MDX file
- If the simulation crashes, check the browser console for errors
- If `view_file` fails on a skill file, the skill hasn't been created yet — inform the user

## Key Rules

1. **NEVER skip a HALT gate.** Always wait for user input.
2. **NEVER write simulation code in Phase 2.** That's Phase 4's job.
3. **ALWAYS read sub-skills before executing their phase.** Don't assume you know what they say.
4. **ALWAYS use the exact file paths** specified in this document.
5. **ALWAYS run `npm run build`** before declaring success.
```
