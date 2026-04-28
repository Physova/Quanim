# SingerBoy's Article Writing Guide

## File Location
Save your `.md` files in the `content/drafts/` folder.
Name files in kebab-case: `friction-basics.md`, `wave-interference.md`

## Required Header
Copy this to the top of every article:
```
---
title: "Your Title"
description: "One sentence about the article."
tags: ["topic1", "topic2"]
difficulty: "Beginner"
---
```
Difficulty options: `"Beginner"`, `"Intermediate"`, `"Advanced"`

## Writing Sections
Use `##` for main sections, `###` for subsections.

## Adding Questions
Use this EXACT table format:
```
| Question text here | number of options | Option A | Option B | Option C | correct option number |
```

Examples:
```
| What is the SI unit of force? | 3 | Joule | Newton | Watt | 2 |
| Energy is always conserved | 2 | True | False | | 1 |
```

Rules:
- The last number is which option is correct (1 = first, 2 = second, etc.)
- Leave empty cells for unused options (like 2-option questions)
- Keep questions on a SINGLE line

## Adding Equations
Just write them naturally! The AI will convert to proper math formatting.

Examples:
- `F = ma`
- `E = mc^2`
- `T = 2 * pi * sqrt(L/g)`
- `f = mu * N`

Greek letters: Write `mu`, `theta`, `alpha`, `omega`, `lambda`, `pi`

## Block Quotes
```
> "Famous physics quote here"
> — Scientist Name
```

## Bold and Italic
- `**bold text**` for bold
- `*italic text*` for italic

## Lists
```
- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item
```
