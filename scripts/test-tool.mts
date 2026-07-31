import { analyzeResumeTool, analyzeResumeInputSchema } from '../src/tools/analyzeResume.ts';

const resume = `JORDAN RIVERA
Frontend Engineer
SUMMARY
Frontend engineer with 5 years of experience building accessible, high-performance web applications with React and TypeScript.
EXPERIENCE
Senior Frontend Engineer — Acme Labs (2022 - Present)
- Architected a component library in React + TypeScript adopted by 6 product teams.
- Reduced initial load time by 38% through performance profiling.
- Implemented end-to-end testing with Jest, cutting regressions in half.
- Led a team of 4 engineers and mentored two junior developers.
PROJECTS
- ResumeScope — a Next.js + AI app. Uses Vercel AI SDK, Zod validation, and CI/CD via GitHub Actions.
SKILLS
TypeScript, React, Next.js, Tailwind CSS, Node.js, Jest, GraphQL, Docker, AWS, CI/CD, Agile
EDUCATION
B.S. Computer Science — University of Washington (2015 - 2019)`;

// 1. Schema validation
const parsed = analyzeResumeInputSchema.parse({ resumeText: resume });
console.log('schema parsed resumeText length:', parsed.resumeText.length);

// 2. Success path
const output = await analyzeResumeTool.execute({ resumeText: resume });
console.log('SUCCESS output:', JSON.stringify(output, null, 2));

// 3. Error path (contains "error")
const badResume = resume.replace('performance profiling', 'error monitoring and profiling');
try {
  await analyzeResumeTool.execute({ resumeText: badResume });
  console.log('ERROR: expected a throw');
} catch (err) {
  console.log('ERROR path threw as expected:', err instanceof Error ? err.message : err);
}

// 4. Schema rejects short text
try {
  analyzeResumeInputSchema.parse({ resumeText: 'short' });
  console.log('ERROR: expected schema failure');
} catch (err) {
  console.log('Schema rejected short text as expected');
}
