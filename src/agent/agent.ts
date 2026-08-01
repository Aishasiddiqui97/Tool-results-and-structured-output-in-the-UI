import { generateObject, generateText, stepCountIs, type LanguageModel } from 'ai';
import { SYSTEM_PROMPT } from './system-prompt.ts';
import { fsTools } from './tools.ts';
import { weeklyReportSchema, type WeeklyReport } from './schemas.ts';

export interface AgentInput {
  week: string;
  userRequest?: string;
}

export interface AgentResult {
  report: WeeklyReport;
  researchNotes: string;
  toolCalls: { tool: string; input: string }[];
}

export async function runWeeklyAgent(
  model: LanguageModel,
  input: AgentInput,
): Promise<AgentResult> {
  const userRequest =
    input.userRequest ??
    `Analyze my week ${input.week} progress. Read my weekly update, learning notes, and project notes, then produce a complete weekly report.`;

  const toolCalls: { tool: string; input: string }[] = [];

  const research = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `${userRequest}

First use your tools to gather information. Read agent-data/weekly-update.md, agent-data/learning.md, and agent-data/projects.md, and list files in the project to check for additional context. Then write a short research summary of what you found, citing source file paths. Do not write the final report yet.`,
    tools: fsTools,
    stopWhen: stepCountIs(8),
    onStepFinish(stepResult) {
      for (const call of stepResult.toolCalls) {
        toolCalls.push({ tool: call.toolName, input: JSON.stringify(call.input) });
      }
    },
  });

  const researchNotes = research.text;

  const { object: report } = await generateObject({
    model,
    schema: weeklyReportSchema,
    system: SYSTEM_PROMPT,
    prompt: `${userRequest}

Below is my research summary gathered from my files. Use ONLY facts present in it. Cite the source file path next to each claim where possible.

RESEARCH SUMMARY:
${researchNotes}

Now produce the structured weekly report.`,
  });

  return { report, researchNotes, toolCalls };
}

export function renderReportMarkdown(report: WeeklyReport): string {
  const lines: string[] = [];
  lines.push(`# Weekly Report — Week ${report.week}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Professional Summary');
  lines.push(report.professionalSummary);
  lines.push('');
  lines.push('## Projects');
  for (const p of report.projects) {
    lines.push(`### ${p.project} — Status: ${p.status}`);
    if (p.completed.length) {
      lines.push('**Completed:**');
      for (const c of p.completed) lines.push(`- ${c}`);
    }
    if (p.problems.length) {
      lines.push('**Problems:**');
      for (const c of p.problems) lines.push(`- ${c}`);
    }
    if (p.nextSteps.length) {
      lines.push('**Next Steps:**');
      for (const c of p.nextSteps) lines.push(`- ${c}`);
    }
    lines.push('');
  }
  lines.push('## Completed Tasks');
  for (const t of report.completedTasks) lines.push(`- [x] ${t}`);
  lines.push('');
  lines.push('## Pending Tasks');
  for (const t of report.pendingTasks) lines.push(`- [ ] ${t}`);
  lines.push('');
  lines.push('## Learning Tracker');
  for (const l of report.learning) {
    lines.push(`- **${l.topic}** (${l.understandingLevel})`);
    lines.push(`  - Concepts: ${l.concepts.join(', ')}`);
    if (l.practiceNeeded.length) lines.push(`  - Practice needed: ${l.practiceNeeded.join(', ')}`);
  }
  lines.push('');
  lines.push('## Next Action Plan');
  report.nextActionPlan.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  lines.push('');
  lines.push('## Next Week Goals');
  for (const g of report.nextWeekGoals) lines.push(`- ${g}`);
  lines.push('');
  lines.push('## LinkedIn Update Suggestion');
  lines.push(`**Headline:** ${report.linkedInPost.headline}`);
  lines.push('');
  lines.push(report.linkedInPost.draft);
  if (report.linkedInPost.hashtags.length) {
    lines.push('');
    lines.push(report.linkedInPost.hashtags.map((h) => `#${h}`).join(' '));
  }
  return lines.join('\n');
}
