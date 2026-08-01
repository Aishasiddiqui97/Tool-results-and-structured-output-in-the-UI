import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fsTools } from '../src/agent/tools.ts';
import { weeklyReportSchema, type WeeklyReport } from '../src/agent/schemas.ts';
import { renderReportMarkdown } from '../src/agent/agent.ts';
import { SYSTEM_PROMPT } from '../src/agent/system-prompt.ts';

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed++;
  console.log(`  PASS  ${name}`);
}
function fail(name: string, detail?: string) {
  failed++;
  console.log(`  FAIL  ${name}${detail ? `\n    ${detail}` : ''}`);
}
function assert(cond: boolean, name: string, detail?: string) {
  if (cond) ok(name);
  else fail(name, detail);
}

const root = path.resolve(import.meta.dirname, '..');

console.log('\n=== 1. Tools (live file reads, no API key) ===');

const weekly = await fsTools.readAgentData.execute({ file: 'weekly-update.md' });
assert(
  weekly.content.includes('Weekly Update') && weekly.content.length > 500,
  'readAgentData reads real weekly-update.md',
  `content length=${weekly.content.length}`,
);
assert(
  !weekly.content.includes('Hallucinated') && !weekly.content.includes('invented'),
  'weekly update contains no invented content',
);

const learning = await fsTools.readAgentData.execute({ file: 'learning.md' });
assert(learning.content.includes('Vercel AI SDK'), 'readAgentData reads real learning.md');

const listing = await fsTools.listFiles.execute({ directory: 'agent-data' });
assert(listing.files.length >= 3, 'listFiles finds agent-data files', listing.files.join(', '));

const readme = await fsTools.readFile.execute({ path: 'README.md' });
assert(readme.content.includes('ResumeScope'), 'readFile reads the real project README');

try {
  await fsTools.readFile.execute({ path: 'C:/Windows/system32/drivers/etc/hosts' });
  fail('path escape is blocked outside project root');
} catch (e) {
  ok('path escape blocked (absolute path)');
}

console.log('\n=== 2. System prompt rules ===');
assert(
  SYSTEM_PROMPT.includes('Do NOT invent completed work'),
  'system prompt forbids invented work',
);
const promptLower = SYSTEM_PROMPT.toLowerCase();
assert(
  promptLower.includes('show sources'),
  'system prompt requires sources',
);
assert(
  promptLower.includes('never delete') && promptLower.includes('never write'),
  'system prompt forbids deletes/writes',
);
assert(
  promptLower.includes('never publish'),
  'system prompt forbids auto-publishing',
);

console.log('\n=== 3. Structured report schema ===');
const sampleReport: WeeklyReport = {
  week: '5',
  generatedAt: '2026-08-01T00:00:00.000Z',
  professionalSummary: 'Finished FE-08 error states for ResumeScope.',
  completedTasks: ['FE-08 error states'],
  pendingTasks: ['FL-07 agent MVP'],
  nextActionPlan: ['Finish FL-07', 'Push to GitHub'],
  projects: [
    {
      project: 'ResumeScope',
      status: 'On Track',
      completed: ['FE-08 error states'],
      problems: ['429 path needed custom UI'],
      nextSteps: ['Record FL-07 demo'],
    },
  ],
  learning: [
    {
      topic: 'AI SDK Tool Parts',
      concepts: ['tool parts', 'fullStream'],
      understandingLevel: 'Intermediate',
      practiceNeeded: ['multi-step tool chains'],
    },
  ],
  linkedInPost: {
    headline: 'Shipped error states',
    draft: 'Shipped FE-08: designed a UI for every way a chat can fail.',
    hashtags: ['AI', 'NextJS'],
  },
  nextWeekGoals: ['Finish FL-07'],
};

const parsed = weeklyReportSchema.parse(sampleReport);
assert(parsed.week === '5', 'schema accepts a valid report');

const bad: WeeklyReport = {
  ...sampleReport,
  projects: [{ ...sampleReport.projects[0], status: 'Unknown' as never }],
};
try {
  weeklyReportSchema.parse(bad);
  fail('schema rejects invalid project status');
} catch {
  ok('schema rejects invalid project status');
}

console.log('\n=== 4. Markdown renderer ===');
const md = renderReportMarkdown(parsed);
assert(md.includes('# Weekly Report — Week 5'), 'renderer has report heading');
assert(md.includes('## Projects') && md.includes('## Completed Tasks'), 'renderer has sections');
assert(md.includes('## LinkedIn Update Suggestion'), 'renderer includes LinkedIn section');

const outPath = path.join(root, 'agent-output', 'sample-report.md');
await writeSample(md);
console.log(`  Wrote sample to ${outPath.replace(root, '')}`);

function writeSample(md: string) {
  return import('node:fs/promises').then((fs) =>
    fs.mkdir(path.dirname(outPath), { recursive: true }).then(() => fs.writeFile(outPath, md, 'utf-8')),
  );
}

// Read-back sanity check
const written = await readFile(outPath, 'utf-8');
assert(written === md, 'sample report written to agent-output');

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
