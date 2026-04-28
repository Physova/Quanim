# Physova Authors' Guide
*(For Physics Writers — No Coding Required!)*

Welcome to Physova! You don't need to know any programming, React, or complex formatting to publish articles here. You write the physics, and your AI assistant handles the code, the layout, and the 3D simulations.

Here is everything you need to know.

---

## 📝 Step 1: Create Your Draft
Create a simple text file inside the `content/drafts/` folder. 
Give it a simple lowercase name with dashes. 
*Example: `motion.md`, `optics-basics.md`, `gravity.md`*

## ✍️ Step 2: Write Naturally

You don't need to write any complicated code or "frontmatter" at the top of your file. The AI reads your document and figures out the title and description for you. 

Just start writing your article using standard Markdown:

- Use `#` for your Main Title
- Use `##` for section headings
- Use `*` or `-` for bullet points
- Use `>` for quotes

*Example:*
```markdown
# Motion and Kinematics

## Introduction
Motion is everywhere. When you drop a ball, it accelerates due to gravity.

- Velocity is speed with a direction.
- Acceleration is the rate of change of velocity.

> "Give me a place to stand, and a lever long enough, and I will move the world."
> — Archimedes
```

## 🧮 Step 3: Math and Equations (The Easy Way)
Do **not** worry about complex formatting for math. You can type math using plain English or standard symbols, and the AI will automatically convert it into beautiful, professional LaTeX math equations on the website.

If you put an equation on its own line, the AI will make it a big, centered formula box.

**What you type in your draft:**
```text
The first equation of motion is:
v = u + a * t

The formula for speed is:
speed = distance / time

The period of a pendulum is:
T = 2 * pi * sqrt(L / g)

For friction, we use mu and theta:
f = mu * N * sin(theta)
```
*(The AI will magically render `mu` as $\mu$, `sqrt` as a real square root, and fractions as real vertical fractions!)*

## 🧠 Step 4: Add Quizzes
To test your students, you can easily insert multiple-choice quizzes using a simple table format.

**You can have 2, 3, 4, 5, or even 6 options!** There is no limit. Just set the "Number of Options" correctly and add as many option columns as you need.

**Format:**
`| Question | Number of Options | Option 1 | Option 2 | Option 3 | ... | Correct Option Number |`

**Examples:**

*True/False (2 options):*
```text
| Acceleration due to gravity on Earth is roughly 9.8 m/s² | 2 | True | False | | 1 |
```

*3 options:*
```text
| What is the SI unit of force? | 3 | Joules | Newtons | Watts | 2 |
```

*4 options (like a real exam!):*
```text
| Which equation gives displacement? | 4 | v = u + at | s = ut + 0.5at^2 | F = ma | E = mc^2 | 2 |
```

*5 options:*
```text
| Which of these is a vector? | 5 | Speed | Mass | Time | Velocity | Temperature | 4 |
```

**Tips:**
- The last number is always which option is correct (1 = first option, 2 = second, etc.)
- For True/False questions, leave extra option columns empty with `| |`
- You can have as many quizzes as you want throughout the article!

---

## 🚀 Step 5: Publishing & Generating 3D Simulations

When your draft is ready, you don't need to touch any code to publish it. 
Open your Gemini CLI (the terminal window) and type:

```bash
/new-article content/drafts/your-file-name.md
```

**What happens next?**
1. The AI will ask you a few questions: What grade level is this for? Do you want a 3D simulation? 
2. If you say "Yes" to a simulation, **just describe what you want the students to see.** (e.g., *"I want a car moving on a track where the student can control initial velocity and acceleration."*)
3. The AI agents will go to work. The Content Formatter will typeset your math. The Simulation Engineer will build your custom 3D interactive physics engine. The Build Master will stitch it all together and launch the website.
4. You will get a link to view your live article!

---

## 🛠️ Step 6: Debugging & Fixing (The `/fix` command)

What if the AI makes a mistake? What if the 3D car drives off the screen, or a math formula looks weird? 

**Do not touch the code!** You can just ask the AI to fix it using the `/fix` command in your Gemini CLI. 

**Examples of what you can type:**
- `/fix the car in the motion simulation drives off the screen, please make the camera zoom out more.`
- `/fix the math equation under the pendulum section looks messy, make sure it's using the right format.`
- `/fix I want the particle color in the simulation to be more visible, make it brighter.`
- `/fix I updated my draft for motion.md, please format the content again.`

The AI orchestrator will figure out exactly which sub-agent needs to fix the problem, fix it, and reboot the server for you.

---

## ⚡ Cheatsheet

| Goal | What you do |
|------|-------------|
| **Start a draft** | Create `content/drafts/topic.md` |
| **Write Math** | Put `F = ma` or `v = u + at` on a new line |
| **Write Greek** | Just type `alpha`, `beta`, `mu`, `theta`, `pi` |
| **Quiz (2 options)** | `\| Is gravity 9.8? \| 2 \| True \| False \| \| 1 \|` |
| **Quiz (3 options)** | `\| SI unit of force? \| 3 \| Joule \| Newton \| Watt \| 2 \|` |
| **Quiz (4 options)** | `\| Equation? \| 4 \| A \| B \| C \| D \| 2 \|` |
| **Publish Article** | Run `/new-article content/drafts/topic.md` in CLI |
| **Fix a Bug** | Run `/fix [describe the problem]` in CLI |
| **Headings** | `# Main Title`, `## Section`, `### Sub-section` |
| **Bold / Italic** | `**bold**` / `*italic*` |
| **Quote** | `> "Quote text" — Author Name` |
| **Bullet List** | Start lines with `- ` or `* ` |

