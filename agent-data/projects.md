# Project Notes

## ResumeScope (main course project)
- Stack: Next.js 15, React 19, TypeScript, Tailwind, Vercel AI SDK 5, OpenAI gpt-4o-mini, Zod, Framer Motion
- Status: FE-08 (error states) complete. Course projects FE-07 (tool results in UI) and FE-08 done.
- Repository: Tool-results-and-structured-output-in-the-UI
- Key files: src/app/api/chat/route.ts, src/components/*, src/tools/analyzeResume.ts, src/lib/errors.ts
- Verification commands: npm run typecheck, npm run build, npm run test:tool, npm run test:stream
- Deployed on Vercel.

## FL-06 Agent Design Doc
- Delivered a 2-page design document for "DayOne" daily planning agent.
- File: FL-06-Agent-Design-Document.md

## FL-07 Agent (current)
- Agent name: AI Internship & Project Assistant
- Goal: weekly progress summary, completed/pending tasks, next action plan, LinkedIn post suggestion
- Platform: OpenAI SDK via Vercel AI SDK, scripted CLI agent
- Data connection: reads local markdown files (agent-data/, README files)

## Learning goal
- Deepen AI SDK knowledge; produce portfolio-grade AI applications, not chatbots.
