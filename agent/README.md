# AI Internship & Project Assistant — FL-07 Agent

A working MVP personal agent that reads my weekly progress updates, learning notes, and project files, then produces a structured weekly report: professional summary, completed/pending tasks, next action plan, learning tracker, and a LinkedIn post suggestion.

## The one core job

> Take my weekly progress updates + project files → analyze them → generate a weekly report (summary, completed, pending, next actions, LinkedIn post).

## Platform choice

**OpenAI SDK (via the Vercel AI SDK)** — because:

1. **It actually runs here.** This repo already has `ai` + `@ai-sdk/openai` installed and an existing tool-calling app. A scripted agent is the smallest working version: no UI, no server, no external accounts beyond the OpenAI key I already use.
2. **Real data connection.** It runs on my machine, so it can read real local files (`agent-data/*.md`, READMEs, source code). Claude Project, Cowork, and Custom GPT sandboxes cannot reliably reach my local filesystem.
3. **Testable without a key.** A mock model verifies the whole pipeline, so CI-style checks work without spending tokens.

**Why not n8n?** n8n is excellent for automation but requires a separate self-hosted or cloud instance, new credential setup, and a visual-flow learning curve. For a 10-hour MVP whose whole point is to reuse my existing AI SDK skills, a ~150-line scripted agent is simpler, cheaper, and fully version-controlled in this repo.

## Architecture

```
scripts/agent.mts          # CLI entry: node scripts/agent.mts --week=5
src/agent/
  system-prompt.ts         # agent instructions & rules
  tools.ts                 # filesystem tools (live data connection)
  schemas.ts               # Zod schemas for structured report
  agent.ts                 # pipeline: research -> structured output -> markdown
agent-data/                # my real data sources (read by the agent)
  weekly-update.md         # this week's progress notes
  learning.md              # topics I studied
  projects.md              # my project notes
agent-output/              # generated reports (git-committed samples)
```

## Data connection (real, not fake)

The agent reads **actual files in this repository** through three tools:

| Tool | Reads | Purpose |
| --- | --- | --- |
| `readAgentData` | `agent-data/weekly-update.md`, `learning.md`, `projects.md` | Primary input — my weekly progress |
| `listFiles` | any directory in the repo | Discovers markdown/source files |
| `readFile` | any file inside the repo root | Reads READMEs, notes, source code for context |

Safety: tools resolve paths against the project root and **refuse any path that escapes it** (verified by test).

## MVP features

1. **Project Progress Analyzer** — per project: status (On Track / At Risk / Blocked / Complete), completed, problems, next steps.
2. **Learning Tracker** — per topic: concepts, understanding level, practice needed.
3. **Weekly Report Generator** — professional summary, completed/pending tasks, next action plan, LinkedIn post draft + hashtags, next-week goals.

## System prompt rules (built in)

- Do NOT invent completed work.
- Do not invent dates, deadlines, or metrics — say "not stated".
- Ask for clarification when critical info is missing.
- Never delete or modify files; only read.
- Never publish anything automatically.
- Always show source file paths.

## Quick start

```bash
# 1. Set your OpenAI key
copy .env.example .env.local   # then edit .env.local

# 2. Run the agent (week 5)
npm run agent -- --week=5

# 3. Or give a custom request
npm run agent -- "Analyze my week 5 progress"

# 4. Run the no-API-key test suite
npm run test:agent
```

The report is written to `agent-output/weekly-report-week-5.md` and printed to the terminal.

## Test run (end-to-end example)

**User request:** `Analyze my week 5 progress.`

**What happens:**

1. Agent reads `agent-data/weekly-update.md` (via `readAgentData`).
2. Agent reads `agent-data/learning.md` and `agent-data/projects.md`.
3. Agent lists project files for extra context (`listFiles`), reads `README.md` (`readFile`).
4. Agent produces a research summary citing sources.
5. `generateObject` builds the structured report, validated by Zod.
6. Markdown report is written to `agent-output/weekly-report-week-5.md`.

**Expected report sections:** Weekly Report — Professional Summary · Projects (status/completed/problems/next steps) · Completed Tasks · Pending Tasks · Learning Tracker · Next Action Plan · Next Week Goals · LinkedIn Update Suggestion.

## Screen recording checklist (2-minute unedited video)

1. Open terminal, show `agent/README.md` (0–10s).
2. Type the user request: `npm run agent -- "Analyze my week 5 progress"` (10–20s).
3. Let it run; narrate or let the log show the agent **accessing files** via tools (20–70s).
4. Show the agent **processing**: the research summary appearing in the terminal (70–90s).
5. Show the **final result**: the full report printed, then open `agent-output/weekly-report-week-5.md` (90–120s).

## Verification

```bash
npm run test:agent   # 16 checks: tools, prompt rules, schema, renderer (no API key)
npm run typecheck    # strict TypeScript
npm run build        # Next.js app still builds
```

See `BUILD_LOG.md` for the honest development log (what failed and how it was fixed).
