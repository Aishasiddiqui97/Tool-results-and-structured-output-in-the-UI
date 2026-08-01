import { createOpenAI } from '@ai-sdk/openai';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { runWeeklyAgent, renderReportMarkdown } from '../src/agent/agent.ts';

const args = process.argv.slice(2);
const weekArg = args.find((a) => a.startsWith('--week='))?.split('=')[1] ?? '5';
const requestIndex = args.findIndex((a) => !a.startsWith('--'));
const userRequest = requestIndex >= 0 ? args[requestIndex] : undefined;

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('ERROR: OPENAI_API_KEY is not set.');
  console.error('Create .env.local (see .env.example) or set the environment variable.');
  process.exit(1);
}

const openai = createOpenAI({ apiKey });
const model = openai(process.env.OPENAI_MODEL ?? 'gpt-4o-mini');

console.log(`\n> AI Internship & Project Assistant`);
console.log(`> Week: ${weekArg} | Model: ${model.modelId}\n`);
console.log('1/3 Gathering information from local files (tools)...');

const { report, researchNotes, toolCalls } = await runWeeklyAgent(model, {
  week: weekArg,
  userRequest,
});

console.log(`\nTools used: ${toolCalls.map((t) => t.tool).join(', ') || 'none'}`);
console.log('2/3 Research summary:\n');
console.log(researchNotes.trim() || '(empty)');

console.log('\n3/3 Generating structured report...');

const markdown = renderReportMarkdown(report);
const outDir = path.resolve(import.meta.dirname, '../agent-output');
await mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `weekly-report-week-${weekArg}.md`);
await writeFile(outFile, markdown, 'utf-8');

console.log('\n--------------------------------------------------');
console.log(markdown);
console.log('--------------------------------------------------');
console.log(`\nReport written to: ${outFile}`);
