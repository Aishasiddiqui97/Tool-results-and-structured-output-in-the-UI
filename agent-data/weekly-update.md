# Weekly Update — Week 5

## What I worked on this week

- Finished FE-08: Error States, Empty States & Edge Cases for the ResumeScope app.
  - Designed a dedicated UI for every failure mode (network drop, 500, 429, mid-stream errors, tool failures).
  - Added a typed error envelope protocol ([RS_ERR]) so the client can classify errors instead of guessing.
  - Built EmptyState, ErrorState, RetryBanner, RateLimitCard, SlowResponse, ToolErrorCard components.
  - Verified all states end-to-end with mock-model stream tests.
- Built FL-06: wrote a 2-page Agent Design Document for a personal daily-planning agent (DayOne).
- Started FL-07: designing and building a personal AI Internship & Project Assistant agent.
- Learned more about the Vercel AI SDK v5 tool parts system and how tool-call state flows to the UI.
- Wrote two technical test scripts (test-tool.mts, test-stream.mts) and got them passing.

## Challenges / blockers

- Mid-stream error handling in AI SDK v5 required digging into the fullStream event lifecycle; it was not obvious from docs alone.
- The 429 rate-limit path needed a custom retry UI because the default error boundary swallowed the status code.
- Time is tight: internship deliverables and this course are due the same week.

## Plans for next week

- Finish FL-07 agent MVP and record the 2-minute demo.
- Push FE-08 work to GitHub and write a LinkedIn post about the error-states approach.
- Start preparing job application materials (cover letter + updated resume).

## Deadlines

- FL-07 submission: this week.
- LinkedIn post about FE-08: this week.
