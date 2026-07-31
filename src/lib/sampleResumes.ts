export type SampleResume = {
  id: string;
  label: string;
  description: string;
  text: string;
};

const FRONTEND_RESUME = `JORDAN RIVERA
Frontend Engineer | San Francisco, CA | jordan.rivera@example.com

SUMMARY
Frontend engineer with 5 years of experience building accessible, high-performance web applications with React and TypeScript. Passionate about developer experience and shipping polished interfaces.

EXPERIENCE
Senior Frontend Engineer — Acme Labs (2022 - Present)
- Architected a component library in React + TypeScript adopted by 6 product teams.
- Reduced initial load time by 38% through code splitting and performance profiling.
- Implemented end-to-end testing with Jest and Playwright, cutting regressions in half.
- Led a team of 4 engineers and mentored two junior developers into mid-level roles.

Frontend Engineer — Brightpath (2019 - 2022)
- Built and shipped 12+ features with Next.js and Tailwind CSS.
- Improved accessibility (WCAG AA) across the marketing site and dashboard.
- Designed REST API integrations with Node.js and PostgreSQL.

PROJECTS
- ResumeScope — a Next.js + AI app that scores resumes. Uses Vercel AI SDK, Zod validation, and CI/CD via GitHub Actions.
- Open-source contributor — maintaned accessibility utilities used by 2k+ developers.

SKILLS
TypeScript, React, Next.js, Tailwind CSS, Node.js, Jest, GraphQL, Docker, AWS, CI/CD, Figma, Agile

EDUCATION
B.S. Computer Science — University of Washington (2015 - 2019)`;

const ERROR_RESUME = `MARIA SANTOS
Data Analyst | Seattle, WA | maria.santos@example.com

SUMMARY
Data analyst focused on turning messy data into decisions. 4 years of experience in SQL, Python, and dashboarding.

EXPERIENCE
Data Analyst — Northwind Analytics (2021 - Present)
- Built automated reporting pipelines in Python and SQL that cut reporting time by 50%.
- Improved data quality by auditing ingestion flows and reducing error rates in production dashboards.
- Designed Tableau dashboards consumed by 40+ stakeholders weekly.

Junior Data Analyst — Finly (2019 - 2021)
- Maintained ETL jobs and data marts in PostgreSQL.
- Collaborated with product teams to define metrics for feature launches.

SKILLS
SQL, Python, PostgreSQL, Tableau, Excel, Git, Agile

EDUCATION
B.A. Statistics — University of Oregon (2015 - 2019)`;

export const sampleResumes: SampleResume[] = [
  {
    id: 'frontend',
    label: 'Frontend Engineer',
    description: 'TypeScript · React · Next.js resume (success path)',
    text: FRONTEND_RESUME,
  },
  {
    id: 'error',
    label: 'Trigger tool error',
    description: 'Contains "error" — simulates a tool failure (error path)',
    text: ERROR_RESUME,
  },
];
