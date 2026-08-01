# BUILD_LOG — AI Internship & Project Assistant (FL-07)

**Date:** 2026-08-01

## What I built

- A scripted CLI agent using the **OpenAI SDK via the Vercel AI SDK** (`ai` 5.0.223 + `@ai-sdk/openai`, gpt-4o-mini) that runs with Node 24 native TypeScript (no build step).
- Three filesystem tools that read **real local data** (`agent-data/weekly-update.md`, `learning.md`, `projects.md`, plus the project README and source files).
- A two-phase pipeline: research (`generateText` + tools, up to 8 steps) → structured report (`generateObject` + Zod schema).
- Structured Zod output for the weekly report: professional summary, completed/pending tasks, next action plan, per-project progress, learning tracker, LinkedIn post draft, next-week goals.
- A mock-model test suite (`scripts/test-agent.mts`) that verifies tools, system prompt rules, schema, and the Markdown renderer — **no API key required**.
- A Markdown renderer that writes the report to `agent-output/weekly-report-week-*.md`.

## What worked

- Reading real local markdown files as the live data connection. No fake data.
- Path traversal protection in the tools (refuses to read outside the project root).
- The mock-model test suite caught real bugs before any API call was made.
- The whole thing runs without a build step using Node 24 native TS execution.

## What failed / errors encountered

1. **Project root path was resolved one level too high.**
   - Error: `ENOENT: ... open 'E:\Python.py\FlyRank.AI\agent-data\weekly-update.md'`
   - Cause: `path.resolve(import.meta.dirname, '../../..')` walked past the repo root (folder names contain a space, which made the mistake hard to see).
   - Fix: changed to `'../..'` so `PROJECT_ROOT` = repo root. Verified by `test-agent.mts`.

2. **TS errors: `.ts` extension imports not allowed.**
   - Error: `TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled`.
   - Cause: Node 24 native TS needs explicit `.ts` extensions in ESM imports, but `tsc` rejected them.
   - Fix: added `"allowImportingTsExtensions": true` to `tsconfig.json` (safe because `noEmit` is already true).

3. **AI SDK 5 API mismatch — `maxSteps` does not exist.**
   - Error: `'maxSteps' does not exist in type ...` and `'mode' does not exist` on `generateObject`.
   - Cause: I wrote against the newer AI SDK API. This repo has `ai@5.0.223`, where the loop cap is `stopWhen: stepCountIs(8)`, `onStepFinish` receives the step result directly (not `{step, text}`), and `generateObject` takes no `mode` option.
   - Fix: rewrote the call to use `stopWhen: stepCountIs(8)` and `onStepFinish(stepResult)`, dropped `mode: 'json'`.

4. **Test assertions were case-sensitive against my own prompt.**
   - My prompt says `ALWAYS show sources`, test searched for `Always show sources`.
   - Fix: lowercased both sides before matching. Minor, but worth logging.

## Features removed

- **A real API-key live run.** I did not run the agent against the OpenAI API during this build (no key present in the environment). The end-to-end path is exercised by the mock-model test instead; the CLI is ready to run once `.env.local` has a key. This is a limitation to verify at recording time.
- **`maxSteps` option** — removed because the installed SDK uses `stopWhen` instead.
- **`mode: 'json'`** — removed from `generateObject` (not part of the installed API).

## Future improvements

- Add a GitHub connection (list repos / read issues) as a second live data source.
- Add a tool that queries the calendar (ICS) for deadline-aware prioritization.
- Persist history across weeks (`agent-output/` already writes reports; add a `previous-week.md` comparison).
- Interactive mode (read the request from stdin) so the recording can show typing a request live.
- Streaming output so the tool-call steps are visible during generation.

## Honesty note

The most important rule I had to keep in the system prompt — *"Do not invent completed work"* — was also the rule most tempting to break in code: a report that "looks complete" is easy to fake, and the test suite is what stops it. The mock test asserts the weekly update has no fabricated content, and the schema rejects unknown project statuses.
