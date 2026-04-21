# Prisma Deployment Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix GitHub Actions workflow by moving Prisma client generation to a postinstall script in `package.json`.

**Architecture:** Moving Prisma generation to `postinstall` ensures it runs automatically after `npm install` (triggered by `vercel build`) using local dependencies. This simplifies the CI workflow and prevents version mismatches.

**Tech Stack:** Prisma, GitHub Actions, Vercel CLI.

---

### Task 1: Update package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add postinstall script**

Add `"postinstall": "prisma generate"` to the `scripts` section.

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate"
  },
```

- [ ] **Step 2: Verify package.json syntax**

Ensure JSON is valid.

### Task 2: Update GitHub Actions Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Remove Generate Prisma Client step**

Remove the following block:
```yaml
      - name: Generate Prisma Client        
        run: npx prisma generate            
```

- [ ] **Step 2: Save the file**

### Task 3: Verification

- [ ] **Step 1: Run local install to verify postinstall**

Run: `npm install`
Expected: Prisma client is generated successfully after install.

- [ ] **Step 2: Check git status**

Run: `git status`
Expected: `package.json` and `.github/workflows/deploy.yml` are modified.
