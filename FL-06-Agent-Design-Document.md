# FL-06 — Agent Design Document: **DayOne**

**Personal Daily Planning Agent**
Author: Frontend AI Engineering Student | Date: 2026-08-01 | Estimated build time: ~10 hours

---

## 1. Agent Overview

| Item | Description |
| --- | --- |
| **Agent Name** | DayOne |
| **Mission** | Start every day with one clear, prioritized, achievable plan that is grounded in real data — not guesswork. |
| **Short Description** | A local-first, single-user agent that reads my task notes, calendar, and GitHub activity each morning and produces a daily brief: today's top priorities, meetings, and deadlines. In the evening it logs what was actually done. |
| **One Job To Be Done** | "Turn my scattered tasks, deadlines, and meetings into one prioritized daily plan — reliably." |
| **Why This Problem Matters** | I juggle AI/SWE learning, Next.js & AI SDK builds, internship assignments, GitHub work, LinkedIn posting, deadlines, and job applications. Context-switching and decision fatigue cause missed deadlines and wasted mornings. |
| **Expected Benefits** | 5–10 minutes saved every morning; fewer missed deadlines; a written record of progress; one source of truth for "what today is about." |

---

## 2. User

| Aspect | Detail |
| --- | --- |
| **Primary User** | Myself (single-user, no multi-tenancy) |
| **Usage Frequency** | Daily in the morning (~5 min) and optional 2-min evening check-in |
| **Typical Workflow** | 1. Brain-dump tasks into a local `tasks.md` and calendar during the day → 2. Morning: run `dayone` → 3. Read a 10–15 line prioritized brief → 4. Execute → 5. Evening: run `dayone --review` to log completion. |
| **Pain Points** | Forgetting deadlines; starting the day without priorities; task list scattered across notes, GitHub issues, and calendar events; no record of what was actually finished. |

---

## 3. Job To Be Done

| Item | Definition |
| --- | --- |
| **Input** | Local Markdown task files (`tasks.md`, per-project notes), a calendar ICS file, optional GitHub issues for own repos, and short free-text quick-adds. |
| **Processing** | Parse tasks with a Markdown parser → extract due dates, tags, and effort hints → fetch today's meetings and deadlines from ICS → (optional) pull open issues labeled `today` from GitHub → dedupe and prioritize by deadline urgency and stated priority. |
| **Output** | A Markdown daily brief: **Top 3 priorities**, meetings with times, deadlines due, a "later" list, and one optional small win. Evening review logs completed items back to a `log.md`. |
| **Success Criteria** | Brief generated in < 30 seconds; every task traceable to its source; nothing dropped or duplicated; priorities match deadlines. |
| **NOT in Scope** | Sending emails, posting to LinkedIn, writing to Google/Notion, auto-closing GitHub issues, scheduling meetings, multi-user access, or any destructive writes. |

---

## 4. Tools Required

| Tool | Purpose | Input | Output | Why Needed |
| --- | --- | --- | --- | --- |
| **Filesystem** | Read/write local task notes and the daily log | File paths, `~/.dayone/` directory | File contents; written log entries | Core storage for all task data |
| **Markdown parser** | Turn raw note files into structured tasks (dates, tags, checked boxes) | Raw Markdown text | Structured task objects | Notes are authored in Markdown |
| **Calendar reader (ICS parser)** | Read exported calendar events/meetings | `.ics` file | Today's events with start time + title | Meetings must appear in the brief |
| **Web fetch** | Download the ICS file from a calendar export URL | HTTPS URL | ICS text | Keeps calendar current without API keys |
| **GitHub API** | Pull open issues on my own repos flagged `today` | Repo names + token (read-only) | Issue titles + due labels | Surfaces repo commitments in the brief |
| **CLI runner** | Run agent as `dayone` / `dayone --review` | Commands | Brief rendered to terminal or file | Simple, scriptable, no UI build needed |

---

## 5. Data Sources

| Source | What Data | How Accessed | Auth | Permissions | Limitations |
| --- | --- | --- | --- | --- | --- |
| `~/.dayone/tasks.md` | My task brain-dump | Filesystem read | None (local) | Read + append | Requires me to maintain it |
| Project `README`/notes | Context for linked tasks | Filesystem read | None | Read-only | Markdown must follow a light convention (dates like `due: 2026-08-04`) |
| Calendar export | Meetings & deadlines | Web fetch of public ICS export URL | None or calendar-provider token | Read-only | ICS refresh lag; offline = stale |
| GitHub issues | Open issues labeled `today` | GitHub REST API | Personal access token (read scope only) | Read-only | Token can be omitted → feature silently disabled |
| Command line | Free-text quick-adds | stdin/args | None | Write to today's plan | Manual, so only used at run time |

---

## 6. Instructions (draft system prompt)

> **Role:** You are DayOne, a meticulous personal planning assistant for a Frontend AI Engineering student. You are concise, deadline-aware, and never invent tasks.
>
> **Objectives:** (1) Produce a daily brief listing top-3 priorities, meetings, and deadlines. (2) Log completions during review mode. (3) Only act on data you actually retrieved.
>
> **Behavior:** Aggregate tasks from all loaded sources. Dedupe by normalized title. Rank by (a) due date proximity, (b) explicit `P1/P2` priority tags, (c) effort. Never merge two unrelated tasks. Never reorder meetings.
>
> **Reasoning limits:** You reason only from retrieved tool output. If a source fails to load, say so and continue with what loaded. Do not guess deadlines, attendees, or statuses.
>
> **Confirmation rules:** Ask before: writing to any external service, closing/deleting tasks, or touching files outside `~/.dayone/`. Never proceed silently on writes.
>
> **Formatting rules:** Emit Markdown. Keep the brief ≤ 15 lines. Use a fixed template: `## Top 3 → ## Meetings → ## Deadlines → ## Later → ## Small win`. Use checkboxes `[ ]` for actionable items. No emojis. No raw stack traces.

---

## 7. Five Evaluation Cases

| # | Scenario | Input | Expected Behavior | Expected Output | Pass Criteria | Fail Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Happy path: 5 tasks, 2 meetings, 1 deadline today | `tasks.md`, ICS with 2 events | Aggregates and ranks by due date | Top 3 priorities include the deadline task; both meetings listed with times | Deadline task is #1; no dropped items; ≤ 15 lines | Deadline task missing or meetings absent |
| 2 | Empty day | Empty task file, no events | No-op grace | Brief says "No tasks or meetings — enjoy the reset" | No fabricated tasks | Agent invents a task |
| 3 | Duplicate task across note + GitHub issue | Same title in `tasks.md` and a `today` issue | Dedupes silently | Single entry, both sources noted | Task appears exactly once | Task appears twice |
| 4 | **Edge:** conflicting deadlines (two tasks due same day, one marked `P1`) | Two `due: today` tasks, one `P1` | Uses priority tag as tiebreaker | `P1` task ranked first with a "conflict" note | Ordering is deterministic and justified | Arbitrary order |
| 5 | **Edge:** calendar fetch fails (offline / 404) | ICS URL unreachable | Fails gracefully | Brief generated from remaining sources + warning line "calendar unavailable" | Brief still produced; user informed | Agent pretends calendar is fine or crashes |
| 6 | **Edge:** malformed task line (no date, no tag) | `buy groceries —` | Handles without guessing | Task listed under "Later" with `no due date` note | Task kept, marked unscheduled | Task dropped, or a fake date invented |
| 7 | **Edge:** a task dated in the past is already checked | `[x] done task (due yesterday)` | Recognizes completion | Excluded from brief; logged in `log.md` | No false re-planning | Task resurfaces as active |

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| **Incorrect information** | Medium | High — wrong priorities | Only rank from retrieved data; flag unavailable sources |
| **Hallucination** | Low–Medium | High — fabricated deadlines/tasks | Never emit a date not present in input; dedupe by exact normalized title |
| **Deleting files** | Low | Critical | Write ops restricted to `~/.dayone/log.md`; never overwrite `tasks.md` |
| **Privacy / sensitive data** | Medium | High | Local-first; ICS fetched with least-privilege token; no data leaves machine except GitHub reads |
| **Wrong assumptions** | Medium | Medium | Confirmation rule before any non-read action; explicit "no due date" labeling |
| **Token leak** | Low | Critical | Token stored in `.env` (git-ignored); scoped to read-only GitHub |

---

## 9. Guardrails

- **Must confirm before:** writing to anything outside `~/.dayone/log.md`, creating files, or any external write.
- **Must never:** delete or rewrite source files, auto-post to LinkedIn/email, send messages, modify GitHub issues, or claim a source was read when it failed.
- **Requires human approval:** archiving tasks, editing past log entries, changing file paths, adding integrations.
- **Failure handling:** every source failure yields an explicit warning in the brief; the run still completes; errors are appended to `~/.dayone/errors.log`; a `--dry-run` flag shows the plan without writes.

---

## 10. Platform Choice

**Recommended: Vercel AI SDK (scripted agent with tool calls).**

Rationale: DayOne is inherently a tool-orchestration problem — parse files, fetch ICS, query GitHub, emit Markdown. The Vercel AI SDK gives typed, Zod-validated tool calls, a streaming-friendly API, and I already build with it daily (my current project is an AI SDK app). It keeps the ~10-hour budget realistic: the whole pipeline is `load → tools → template → write`, no UI build required. It also doubles as portfolio work that matches my learning path.

**Comparison vs. Custom GPT:** Custom GPT offers structured outputs and easy deployment, but it runs in a sandbox with no access to my local filesystem or private ICS exports, cannot keep a persistent local log, and adds a third-party privacy surface. The AI SDK version runs fully local, is free to iterate on, and reuses skills I already have — a better fit for both the assignment and my career goal.

---

## 11. Future Improvements (V2)

- Notion task sync (write-back of completed items)
- Google Calendar two-way write (propose re-scheduling)
- LinkedIn "post draft" suggestions generated from logged wins (human approves before posting)
- Slack/WhatsApp daily-brief delivery
- Weekly retro summary + time-tracking from `log.md`
- Multi-user / onboarding mode
