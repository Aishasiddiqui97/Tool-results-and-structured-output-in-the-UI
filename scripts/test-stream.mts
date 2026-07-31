import { convertToModelMessages, streamText, stepCountIs } from 'ai';
import { analyzeResumeTool } from '../src/tools/analyzeResume.ts';

const RESUME = `JORDAN RIVERA
Frontend Engineer
SUMMARY
Frontend engineer with 5 years of experience building accessible, high-performance web applications with React and TypeScript.
EXPERIENCE
Senior Frontend Engineer - Acme Labs (2022 - Present)
- Architected a component library in React + TypeScript adopted by 6 product teams.
- Reduced initial load time by 38% through performance profiling.
- Implemented end-to-end testing with Jest, cutting regressions in half.
- Led a team of 4 engineers and mentored two junior developers.
PROJECTS
- ResumeScope - a Next.js + AI app. Uses Vercel AI SDK, Zod validation, and CI/CD via GitHub Actions.
SKILLS
TypeScript, React, Next.js, Tailwind CSS, Node.js, Jest, GraphQL, Docker, AWS, CI/CD, Agile
EDUCATION
B.S. Computer Science - University of Washington (2015 - 2019)`;

const USAGE = { inputTokens: 10, outputTokens: 5, totalTokens: 15 };

function toolCallChunks(args: string) {
  return [
    { type: 'stream-start', warnings: [] },
    { type: 'tool-input-start', id: 'call_1', toolName: 'analyzeResume' },
    { type: 'tool-input-delta', id: 'call_1', delta: args },
    { type: 'tool-input-end', id: 'call_1' },
    { type: 'tool-call', toolCallId: 'call_1', toolName: 'analyzeResume', input: args },
    { type: 'finish', finishReason: 'tool-calls', usage: USAGE },
  ];
}

function textChunks(text: string) {
  return [
    { type: 'stream-start', warnings: [] },
    { type: 'text-start', id: 't1' },
    { type: 'text-delta', id: 't1', delta: text },
    { type: 'text-end', id: 't1' },
    { type: 'finish', finishReason: 'stop', usage: USAGE },
  ];
}

function makeMockModel(streams: unknown[][]) {
  let call = 0;
  return {
    specificationVersion: 'v2',
    provider: 'mock',
    modelId: 'mock-resume',
    supportsStructuredOutputs: false,
    doGenerate: async () => {
      throw new Error('unused');
    },
    doStream: async () => {
      const chunks = streams[Math.min(call++, streams.length - 1)];
      return { stream: ReadableStream.from(chunks) };
    },
  };
}

async function run({ resumeText }: { resumeText: string }) {
  const model = makeMockModel([
    toolCallChunks(JSON.stringify({ resumeText })),
    textChunks('Analysis complete.'),
  ]);

  const result = streamText({
    model: model as never,
    messages: convertToModelMessages([
      { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'Please analyze this resume.' }] },
    ]),
    tools: { analyzeResume: analyzeResumeTool },
    stopWhen: stepCountIs(8),
  });

  const response = result.toUIMessageStreamResponse();
  const raw = await new Response(response.body).text();
  const lines = raw.split('\n').filter((l) => l.startsWith('data: '));
  const events = lines
    .map((l) => l.slice(6).trim())
    .filter((l) => l !== '[DONE]')
    .map((l) => JSON.parse(l));
  return events.map((e) => ({ type: e.type, toolName: e.toolName, state: e.state }));
}

const types = await run({ resumeText: RESUME });
console.log('EVENTS:');
for (const t of types) console.log('  ', JSON.stringify(t));

const badTypes = await run({
  resumeText: RESUME.replace('performance profiling', 'error monitoring and profiling'),
});
console.log('ERROR EVENTS:');
for (const t of badTypes) console.log('  ', JSON.stringify(t));
