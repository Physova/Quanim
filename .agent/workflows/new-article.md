---
name: new-article
description: "Create a new physics article from a raw .md draft file. Handles content formatting, simulation generation, and build validation."
---

# New Article Workflow

Invoke the article-orchestrator skill to process a new physics article.

## Usage

The user should provide a path to their raw `.md` draft file.

## Steps

1. Read `.agent/skills/article-orchestrator/SKILL.md` using `view_file`
2. Follow the orchestrator skill exactly through all 5 phases
3. The orchestrator will delegate to sub-skills automatically
