# Physova Authors' Guide (v3)
*(For Physics Writers — No Coding Required!)*

Welcome to Physova v3! This guide is designed for **singerboy** and other partners to publish high-fidelity physics articles using the automated Gemini pipeline.

---

## 🚀 Getting Started (One-Time Setup)

If your project folder feels outdated, follow these steps to ensure you have the latest **Physova v3** engine:

1.  **Fresh Workspace**: Create a new folder on your computer.
2.  **Clone/Pull**: Open your terminal and run `git clone [repository-url]` or pull the latest changes from the `main` branch.
3.  **Install Engine**: Run `npm install` to set up the dependencies.
4.  **Connect Gemini**: Ensure your `.gemini` folder is present and the CLI is ready.

---

## ✍️ Step 1: Drafting Your Content

Physova is a "Content-as-Code" platform. You write in a folder called `content/drafts/`.

1.  **Create a file**: Create `content/drafts/my-topic.md`.
2.  **Write Naturally**: Use `# Heading`, `## Section`, and `* Bullet Points`.
3.  **Math**: Put equations on their own lines like `F = ma` or `v = u + at`. The AI will handle the LaTeX formatting.
4.  **Quizzes**: Use this format:
    `| Question | Number of Options | Option 1 | Option 2 | Option 3 | Option 4 | Correct Option |`

---

## 🛠️ Step 2: The Publishing Pipeline

When your `.md` file is ready, you initiate the **v3 Orchestrator** in your Gemini CLI:

### 1. The Build Command
Type this in the CLI:
```bash
/new-article content/drafts/my-topic.md
```

### 2. The Interview
The AI will ask you:
- **Grade Level**: (e.g., Grade 9, Grade 11).
- **Simulation**: Do you want a 3D Lab? (Say **YES**).
- **Description**: Describe what you want. 
    - *Example*: "I want a car on a track with a friction slider and an acceleration graph."

### 3. The Execution
The sub-agents will then:
- **Format**: Convert your draft to professional `.mdx`.
- **Engineer**: Build a **custom 3D simulation** using Three.js.
- **Validate**: Run a production build to ensure 0 errors.

---

## 🔧 Step 3: Refinement & Fixing

If the simulation needs tweaking or the math looks off, use the `/fix` command:

```bash
/fix The car simulation starts too fast. Make it start paused and add a "Play" button.
```

### 💡 Pro-Tips for v3 Simulations:
- **Pause by Default**: Always ask the AI to make simulations "paused on load" to prevent distracting the reader.
- **Hover States**: Ask for "hover animations" on interactive buttons for a premium feel.
- **Related Topics**: The system now automatically links your new article to others based on tags.

---

## 📂 Summary of Workflow
1. **Drag & Drop** your `.md` draft into `content/drafts/`.
2. **Run** `/new-article` in the CLI.
3. **Verify** on `localhost:3000`.
4. **Fix** any issues using `/fix`.

---
**Version:** 3.0.0-PROD
**Updated:** 2026-04-28
