import { tool } from 'ai';
import { z } from 'zod';

export const analyzeResumeInputSchema = z.object({
  resumeText: z
    .string()
    .min(10, 'Resume text must be at least 10 characters.')
    .max(12000, 'Resume text is too long (max 12,000 characters).'),
});

export const analyzeResumeOutputSchema = z.object({
  score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  keywords: z.array(z.string()),
});

export type AnalyzeResumeOutput = z.infer<typeof analyzeResumeOutputSchema>;

const KEYWORD_GROUPS: Record<string, { label: string; weight: number }> = {
  typescript: { label: 'TypeScript', weight: 3 },
  react: { label: 'React', weight: 3 },
  'next.js': { label: 'Next.js', weight: 2 },
  nextjs: { label: 'Next.js', weight: 2 },
  'node.js': { label: 'Node.js', weight: 2 },
  node: { label: 'Node.js', weight: 1 },
  tailwind: { label: 'Tailwind CSS', weight: 1 },
  css: { label: 'CSS', weight: 1 },
  html: { label: 'HTML', weight: 1 },
  graphql: { label: 'GraphQL', weight: 2 },
  'ci/cd': { label: 'CI/CD', weight: 2 },
  aws: { label: 'AWS', weight: 2 },
  azure: { label: 'Azure', weight: 2 },
  docker: { label: 'Docker', weight: 2 },
  kubernetes: { label: 'Kubernetes', weight: 2 },
  postgres: { label: 'PostgreSQL', weight: 2 },
  sql: { label: 'SQL', weight: 1 },
  python: { label: 'Python', weight: 2 },
  jest: { label: 'Jest', weight: 2 },
  testing: { label: 'Testing', weight: 1 },
  accessibility: { label: 'Accessibility', weight: 2 },
  performance: { label: 'Performance', weight: 1 },
  rest: { label: 'REST APIs', weight: 1 },
  agile: { label: 'Agile', weight: 1 },
  git: { label: 'Git', weight: 1 },
  prisma: { label: 'Prisma', weight: 1 },
  redux: { label: 'Redux', weight: 1 },
  figma: { label: 'Figma', weight: 1 },
  mentoring: { label: 'Mentoring', weight: 2 },
  microservices: { label: 'Microservices', weight: 2 },
};

const ACTION_VERBS = [
  'built',
  'led',
  'designed',
  'architected',
  'optimized',
  'improved',
  'reduced',
  'shipped',
  'scaled',
  'launched',
  'mentored',
  'created',
  'developed',
  'drove',
  'implemented',
];

const STRUCTURE_SECTIONS = ['experience', 'education', 'skills', 'projects'];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function analyzeResume(resumeText: string): AnalyzeResumeOutput {
  const text = resumeText.toLowerCase();
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

  const matched = new Map<string, number>();
  for (const [token, { label, weight }] of Object.entries(KEYWORD_GROUPS)) {
    if (text.includes(token)) {
      matched.set(label, Math.max(matched.get(label) ?? 0, weight));
    }
  }
  const keywords = [...matched.keys()];
  const keywordWeight = [...matched.values()].reduce((a, b) => a + b, 0);

  const verbCount = ACTION_VERBS.filter((verb) => text.includes(verb)).length;
  const presentSections = STRUCTURE_SECTIONS.filter((section) =>
    text.includes(section),
  );

  let score = 18; // baseline
  score += Math.min(36, keywordWeight); // up to 36 pts from tooling keywords
  score += Math.min(12, verbCount * 2); // up to 12 pts from action verbs
  score += Math.min(15, presentSections.length * 5); // up to 15 pts for structure
  score += wordCount >= 1200 ? 16 : wordCount >= 600 ? 10 : wordCount >= 300 ? 5 : 0;
  score += wordCount >= 80 ? 3 : 0;
  score = Math.max(0, Math.min(100, score));

  const strengths: string[] = [];
  if (matched.has('React') && matched.has('TypeScript')) {
    strengths.push('Strong modern frontend foundation (React + TypeScript).');
  }
  if (matched.has('Next.js')) {
    strengths.push('Frameworks in use are production-grade (Next.js).');
  }
  if (verbCount >= 3) {
    strengths.push('Results-focused writing with strong action verbs.');
  }
  if (presentSections.includes('experience') && presentSections.includes('projects')) {
    strengths.push('Clear structure: both work experience and projects are documented.');
  }
  if (matched.has('AWS') || matched.has('Docker') || matched.has('CI/CD')) {
    strengths.push('Cloud and DevOps signals detected (deployable, not just local).');
  }
  if (strengths.length === 0) {
    strengths.push('Resume text is readable and includes core professional content.');
  }

  const improvements: string[] = [];
  if (!presentSections.includes('skills')) {
    improvements.push('Add a dedicated "Skills" section so keyword scanning is easy.');
  }
  if (!presentSections.includes('education')) {
    improvements.push('Include an "Education" section for completeness.');
  }
  if (verbCount < 3) {
    improvements.push('Use stronger action verbs (built, scaled, shipped) to describe impact.');
  }
  if (wordCount < 600) {
    improvements.push('Expand the resume — under 600 words reads as light on experience.');
  }
  if (!matched.has('AWS') && !matched.has('Docker') && !matched.has('Azure') && !matched.has('CI/CD')) {
    improvements.push('Mention deployment/cloud experience (AWS, Docker, CI/CD) if applicable.');
  }
  if (!matched.has('testing')) {
    improvements.push('Highlight testing practices (unit/integration tests) to strengthen quality signals.');
  }
  if (!matched.has('accessibility')) {
    improvements.push('Add accessibility (a11y) wins — teams increasingly screen for it.');
  }
  if (improvements.length === 0) {
    improvements.push('No critical gaps found — focus on quantifying impact with metrics.');
  }

  return {
    score,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    keywords: keywords.slice(0, 8),
  };
}

export const analyzeResumeTool = tool({
  description: `Analyze a resume's quality and return a structured score (0-100), key strengths, suggested improvements, and detected skill keywords. Call this whenever the user provides or pastes resume text.`,
  inputSchema: analyzeResumeInputSchema,
  execute: async ({ resumeText }) => {
    // Simulated failure path (requirement: error testing).
    // If the resume text contains "error", the tool throws so the UI
    // can demonstrate the designed output-error state + retry flow.
    if (resumeText.toLowerCase().includes('error')) {
      throw new Error(
        'The resume parser could not process this document — invalid formatting detected near line 12. Please review and resubmit.',
      );
    }

    // Simulated server-side work so the input-streaming -> output-available
    // transition is visible in the UI.
    await delay(850 + Math.round(Math.random() * 600));

    return analyzeResume(resumeText);
  },
});
