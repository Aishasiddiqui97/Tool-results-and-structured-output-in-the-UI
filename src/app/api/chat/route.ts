import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  tool,
  type StreamTextTransform,
  type ToolSet,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { analyzeResumeTool, type AnalyzeResumeOutput } from '@/tools/analyzeResume';
import { analyzeResumeInputSchema } from '@/tools/analyzeResume';
import { errorEnvelope } from '@/lib/errors';
import { isTestMode } from '@/lib/testMode';

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are ResumeScope, an AI career assistant inside a resume-analysis application.

When the user provides resume text, you MUST call the analyzeResume tool with the complete resume text in the "resumeText" field. After the tool returns, summarize the result naturally and concisely: lead with the score, then the strongest 2-3 points and the most important improvement. Do not invent metrics — only report what the tool returned.

If the tool fails, acknowledge the failure briefly and let the user know they can retry.

For casual conversation (greetings, questions), answer helpfully without calling the tool. Keep all responses concise.`;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulated `analyzeResume` that always fails — used by ?test=tool. */
const forcedErrorTool = tool({
  description: analyzeResumeTool.description,
  inputSchema: analyzeResumeInputSchema,
  execute: async ({ resumeText }: { resumeText: string }): Promise<AnalyzeResumeOutput> => {
    void resumeText;
    await delay(700);
    throw new Error(
      'Simulated tool failure (?test=tool): the resume parser could not finish scoring this document.',
    );
  },
});

/**
 * Simulated mid-stream connection loss — used by ?test=stream.
 * Streams a few tokens normally, then errors the stream so the client sees the
 * "we lost connection" path while streaming.
 */
function midStreamFault<TOOLS extends ToolSet = any>(): StreamTextTransform<TOOLS> {
  return () => {
    let chunkCount = 0;
    return new TransformStream({
      async transform(chunk, controller) {
        if (chunkCount >= 2) {
          // Let a little content reach the user, then cut the connection.
          await delay(500);
          throw new Error('Simulated mid-stream network interruption (?test=stream).');
        }
        chunkCount += 1;
        controller.enqueue(chunk);
      },
    });
  };
}

export async function POST(req: Request) {
  try {
    const body: { messages?: UIMessage[]; testMode?: unknown } = await req.json();
    const { messages } = body;
    const testMode = isTestMode(String(body.testMode ?? '')) ? body.testMode : undefined;

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: errorEnvelope('server', 'The request payload was invalid.'),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // ?test=429 — reject before any streaming begins.
    if (testMode === '429') {
      return new Response(
        JSON.stringify({
          error: errorEnvelope(
            'rate_limit',
            "You've reached today's request limit.",
            { retryAfter: 3600 },
          ),
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // ?test=server — throw so the catch below returns a 500 envelope.
    if (testMode === 'server') {
      throw new Error('Simulated unexpected server exception (?test=server).');
    }

    const result = streamText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      tools: {
        analyzeResume: testMode === 'tool' ? forcedErrorTool : analyzeResumeTool,
      },
      toolChoice: 'auto',
      // Guard against runaway loops; the model normally finishes after the
      // tool result is fed back and it produces a final summary.
      stopWhen: stepCountIs(8),
      temperature: 0.4,
      ...(testMode === 'stream' ? { experimental_transform: midStreamFault() } : {}),
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        const detail = error instanceof Error ? error.message : '';
        console.error('Chat stream error:', detail);
        // A stream fault is surfaced as a connection loss; everything else is
        // treated as a server-side failure. Tool errors are already emitted as
        // `output-error` parts and never reach this path.
        const code = testMode === 'stream' ? 'stream' : 'server';
        return errorEnvelope(
          code,
          code === 'stream'
            ? 'We lost connection while generating your response.'
            : 'Something went wrong on our end while generating your response.',
        );
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    console.error('Chat route error:', detail);
    return new Response(
      JSON.stringify({
        error: errorEnvelope(
          'server',
          'Something went wrong on our end. Please try again.',
        ),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
