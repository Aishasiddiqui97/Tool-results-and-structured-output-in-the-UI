# ResumeScope — FE-07: Tool Results & Structured Output in the UI

A real AI application (not a chatbot wrapper) that scores resumes using the **Vercel AI SDK**, typed tool parts, **Zod** schema validation, and **Framer Motion** animations.

The assistant owns one server-side tool, `analyzeResume`. Its entire lifecycle — from "what the AI is about to do" through "what input was sent", "what result came back", and "what went wrong" — is rendered as four distinct, animated UI states. Results are never shown as raw JSON.

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
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # AI route: registers the tool, streams lifecycle
│   │   ├── globals.css               # Tailwind + custom scrollbar
│   │   ├── layout.tsx                # Root layout (dark theme)
│   │   └── page.tsx                  # Main app UI (chat + empty state + samples)
│   ├── components/
│   │   ├── ToolCallCard.tsx          # Dispatcher: header + crossfade between states
│   │   ├── ToolInputStreaming.tsx    # State A — animated loading, progress, steps
│   │   ├── ToolInputAvailable.tsx    # State B — formatted input (cards/badges, no JSON)
│   │   ├── ToolOutputCard.tsx        # State C — routes output to real UI components
│   │   ├── ToolErrorState.tsx        # State D — designed error + retry button
│   │   ├── ResumeScoreCard.tsx       # Animated score ring, strengths, improvements, keywords
│   │   └── ChatMessage.tsx           # Renders message.parts (text, step-start, tool parts)
│   ├── lib/
│   │   ├── chat.ts                   # End-to-end typed tool map (UIMessage<..., Tools>)
│   │   └── sampleResumes.ts          # Sample resumes incl. an error-triggering one
│   └── tools/
│       └── analyzeResume.ts          # AI SDK tool definition (Zod schema + execute)
└── scripts/
    ├── test-tool.mts                 # Unit check: schema, success path, error path
    └── test-stream.mts               # E2E: mock-model stream lifecycle (states verified)
```

> Note: the project uses the `src/` directory layout, so the API route lives at `src/app/api/chat/route.ts` (URL: `/api/chat`).

---

## AI Tool Contract

**Tool Name:** `analyzeResume`

**Purpose:** Analyzes resume quality using AI and returns a structured, typed score that the UI renders as a real component.

**Input Schema:**

| Field        | Type   | Constraints                    |
| ------------ | ------ | ------------------------------ |
| `resumeText` | string | min 10, max 12,000 characters |

**Return Shape:**

| Field         | Type       | Description                             |
| ------------- | ---------- | --------------------------------------- |
| `score`       | number     | 0–100 overall resume quality            |
| `strengths`   | string[]   | Highlighted strengths                   |
| `improvements`| string[]   | Concrete, actionable improvements       |
| `keywords`    | string[]   | Detected skill keywords                 |

**Execution:** Server-side tool executed through AI SDK `tool()` with a Zod `inputSchema` and an async `execute` function. The model decides when to call it (`toolChoice: "auto"`). The tool result is fed back to the model, which then writes a concise summary — so the stream always ends with human text after the structured result.

---

## How the Tool Lifecycle Renders

AI SDK 5 exposes tools as **typed tool parts** inside `message.parts` (`type: "tool-analyzeResume"`). Each part has a `state`. The UI maps each state to its own component inside `ToolCallCard`, with a Framer Motion crossfade between states.

| State            | Component               | What the user sees                              |
| ---------------- | ----------------------- | ----------------------------------------------- |
| `input-streaming`| `ToolInputStreaming`    | Animated icon, progress bar, step checklist     |
| `input-available`| `ToolInputAvailable`    | Resume doc card: word/char count, section chips, truncated preview |
| `output-available`| `ToolOutputCard` → `ResumeScoreCard` | Animated score ring, strength badges, improvement list, keyword chips |
| `output-error`   | `ToolErrorState`        | Error icon, friendly message, retry button      |

The transition from `input-streaming` → `output-available` crossfades smoothly (opacity + y-slide) inside a stable card shell, so there are no layout jumps.

## Error Testing

Two ways to see the designed error state (requirement 7):

1. **In the UI** — load the **“Trigger tool error”** sample resume (its text contains `"error"`). The tool’s `execute` throws, the stream emits `tool-output-error`, and the error card appears with a **Retry** button. The app never crashes.
2. **Headless** — run `npm run test:tool` (throws + schema tests) or `npm run test:stream` (verifies the `tool-output-error` stream event with a mock model).

The retry button calls `regenerate({ messageId })`, which re-runs the failed assistant step through the model.

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

Open [http://localhost:3000](http://localhost:3000), click a sample resume, and watch the tool lifecycle render — then send a resume containing the word `error` to see the error state.

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
2. In Vercel, **Add New → Project** and import the repo. Vercel auto-detects Next.js (zero-config).
3. Add the environment variable `OPENAI_API_KEY` (Settings → Environment Variables).
4. **Deploy.** The `api/chat` route runs as a serverless function; `maxDuration` is set to 30s.
5. (Optional) Set `OPENAI_MODEL` if you want a different model.

The app is fully static on the client except for `/api/chat`, so it deploys and scales the same way on any Node host (`next build && next start`).
