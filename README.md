# ResumeScope - FE-08: Error States, Empty States & Edge Cases

A real AI application (not a chatbot wrapper) that scores resumes using the **Vercel AI SDK**, typed tool parts, **Zod** schema validation, and **Framer Motion** animations.

FE-08 hardens the app against every way a chat can fail or feel empty. Every failure mode has its own designed UI: network drops, server errors, rate limits, tool failures, slow responses, and unexpected exceptions. Empty conversations, empty search results, and the loading skeleton are all first-class screens. The app never shows a raw stack trace and never crashes.

## Tech Stack

| Layer      | Tech                                       |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router) + React 19         |
| Language   | TypeScript (strict)                        |
| Styling    | Tailwind CSS 3.4                           |
| AI         | Vercel AI SDK 5 (`ai`, `@ai-sdk/react`)    |
| Model      | OpenAI via `@ai-sdk/openai` (gpt-4o-mini)  |
| Validation | Zod 3.25                                   |
| Animation  | Framer Motion 12                           |
| Icons      | lucide-react                               |

## Folder Structure

```
.
src/
  app/
    api/chat/route.ts            # AI route: envelope protocol + fault injection
    error.ts                     # Next.js error boundary (root-level crash)
    globals.css                  # Tailwind, viewport, reduced-motion, focus ring
    layout.tsx                   # Root layout + Viewport config
    page.tsx                     # Suspense + ChatSkeleton fallback
  components/
    Chat.tsx                     # Orchestrator: useChat, error dispatch, slow timer
    ChatMessage.tsx              # Renders message.parts incl. streaming/stopped
    ChatSkeleton.tsx             # Message/Tool/ScoreCard skeletons (Suspense)
    EmptyState.tsx               # Shared empty-state shell (icon + actions)
    ErrorState.tsx               # Friendly error screen (+ fullPage for boundary)
    FirstRun.tsx                 # Empty conversation: prompt chips + sample cards
    NoResults.tsx                # No-search-results state
    RateLimitCard.tsx            # 429 card: retry / upgrade / learn more
    RetryBanner.tsx              # Connection-lost card: retry / cancel / new chat
    ResumeScoreCard.tsx          # Animated score ring, strengths, improvements
    SlowResponse.tsx             # "Still thinking" + progress + stop generation
    ToolCallCard.tsx             # Dispatcher for tool part states
    ToolErrorCard.tsx            # Tool failure card: details + retry tool
  lib/
    chat.ts                      # End-to-end typed tool map
    errors.ts                    # [RS_ERR] envelope protocol + classifyError
    sampleResumes.ts             # Sample resumes incl. error-triggering one
    testMode.ts                  # ?test= URL switches for fault injection
  tools/
    analyzeResume.ts             # AI SDK tool definition (Zod schema + execute)
scripts/
  test-tool.mts                  # Unit check: schema, success path, error path
  test-stream.mts                # E2E: mock-model stream lifecycle (states verified)
```

> The project uses the `src/` layout, so the API route lives at `src/app/api/chat/route.ts` (URL: `/api/chat`).

---

## Failure & State Inventory

Each scenario has a dedicated designed UI:

| Scenario | Trigger | UI |
| -------- | ------- | -- |
| First-run empty conversation | Fresh page, no messages | `FirstRun` - prompt chips + sample resumes |
| Empty input | Send with empty composer | Inline validation + shake |
| Slow AI response | Response > 3s | `SlowResponse` - typing indicator, progress bar, Stop |
| Network failure (no request) | `?test=network` or go offline | `RetryBanner` (Retry / Cancel / Start New Chat) |
| Network failure mid-stream | Go offline mid-response | `RetryBanner` + Regenerate on partial message |
| API error before streaming | `?test=server` (500) | `ErrorState` (Retry / Back to Home) |
| Rate limit (429) | `?test=429` | `RateLimitCard` (Retry Later / Upgrade / Learn More) |
| Error mid-stream | `?test=stream` | `RetryBanner` (stream kind) |
| Tool failure | `?test=tool` or resume with "error" | `ToolErrorCard` (details + Retry Tool) |
| User cancels generation | Stop button | Stopped chip + Regenerate |
| No search results | Assistant "no results" | `NoResults` - Try another search |
| Unexpected exception | Root-level error | `error.ts` boundary + `ErrorState` |

## Error Protocol

The server encodes every failure into a compact envelope so the client can classify it instead of guessing:

```
[RS_ERR]{"code":"rate_limit","message":"...","retryAfter":15}
```

- `src/lib/errors.ts` - `errorEnvelope()` / `decodeErrorEnvelope()` / `classifyError()`.
- `classifyError()` returns one of `rate_limit | network | stream | server | tool | unknown`, with fallback heuristics for `Failed to fetch`, `fetch failed`, and HTTP 429 bodies.
- The AI SDK surfaces non-2xx bodies and mid-stream `errorText` as `error.message` on the client (verified in `ai@5` internals: `fullStream` emits `{type:"error"}`, which becomes an SSE `error` chunk, which becomes `useChat.error`).

## Fault Injection (testing)

Append a query param to simulate failures without touching production code:

| Mode | Trigger | Behavior |
| ---- | ------- | -------- |
| `?test=network` | Client transport | `TypeError('Failed to fetch')` before request |
| `?test=429` | Route | 429 + rate-limit envelope |
| `?test=server` | Route | 500 before streaming |
| `?test=stream` | Route | Streams ~2 chunks then throws mid-stream |
| `?test=tool` | Route | `analyzeResume` forced to fail |

## Accessibility & Mobile

- Visually-hidden `aria-live` region announces status changes; streaming assistant messages announce via `aria-live="polite"`; error cards use `role="alert"`.
- `prefers-reduced-motion` disables all decorative animation globally.
- Visible `:focus-visible` ring everywhere; `overscroll-behavior: none` on mobile.
- `viewportFit: cover` + `interactiveWidget: resizes-content` for iOS Safari keyboard; `visualViewport`-based keyboard inset fallback; `100dvh` layout.

---

## Getting Started

### Prerequisites

- Node.js 20.9+ (tests use Node 24+ native TypeScript support)
- An OpenAI API key (or any provider supported by the AI SDK)

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then set your key:

```
OPENAI_API_KEY=sk-...
```

Optionally override the model: `OPENAI_MODEL=gpt-4o-mini`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Test each failure with the `?test=...` switches above, click a sample resume for the happy path, and send a resume containing the word `error` to see the tool error state.

### 4. Verification commands

```bash
npm run typecheck     # strict TypeScript check
npm run build         # production build
npm run test:tool     # tool: schema + success + error path
npm run test:stream   # stream: verifies tool lifecycle events (mock model, no API key)
```

---

## Deployment (Vercel)

1. Push this repository to GitHub.
2. In Vercel, **Add New -> Project** and import the repo. Vercel auto-detects Next.js (zero-config).
3. Add the environment variable `OPENAI_API_KEY` (Settings -> Environment Variables).
4. **Deploy.** The `api/chat` route runs as a serverless function; `maxDuration` is set to 30s.
5. (Optional) Set `OPENAI_MODEL` if you want a different model.

The app is fully static on the client except for `/api/chat`, so it deploys and scales the same way on any Node host (`next build && next start`).
