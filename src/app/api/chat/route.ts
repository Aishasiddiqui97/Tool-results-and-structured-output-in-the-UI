import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { analyzeResumeTool } from '@/tools/analyzeResume';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are ResumeScope, an AI career assistant inside a resume-analysis application.

When the user provides resume text, you MUST call the analyzeResume tool with the complete resume text in the "resumeText" field. After the tool returns, summarize the result naturally and concisely: lead with the score, then the strongest 2-3 points and the most important improvement. Do not invent metrics — only report what the tool returned.

If the tool fails, acknowledge the failure briefly and let the user know they can retry.

For casual conversation (greetings, questions), answer helpfully without calling the tool. Keep all responses concise.`;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      tools: {
        analyzeResume: analyzeResumeTool,
      },
      toolChoice: 'auto',
      // Guard against runaway loops; the model normally finishes after the
      // tool result is fed back and it produces a final summary.
      stopWhen: stepCountIs(8),
      temperature: 0.4,
    });

    return result.toUIMessageStreamResponse({
      onError: (error) =>
        error instanceof Error ? error.message : 'An unexpected error occurred.',
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
