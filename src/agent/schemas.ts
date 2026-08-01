import { z } from 'zod';

export const projectProgressSchema = z.object({
  project: z.string(),
  status: z.enum(['On Track', 'At Risk', 'Blocked', 'Complete']),
  completed: z.array(z.string()),
  problems: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export const learningEntrySchema = z.object({
  topic: z.string(),
  concepts: z.array(z.string()),
  understandingLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  practiceNeeded: z.array(z.string()),
});

export const weeklyReportSchema = z.object({
  week: z.string(),
  generatedAt: z.string(),
  professionalSummary: z.string(),
  completedTasks: z.array(z.string()),
  pendingTasks: z.array(z.string()),
  nextActionPlan: z.array(z.string()),
  projects: z.array(projectProgressSchema),
  learning: z.array(learningEntrySchema),
  linkedInPost: z.object({
    headline: z.string(),
    draft: z.string(),
    hashtags: z.array(z.string()),
  }),
  nextWeekGoals: z.array(z.string()),
});

export type WeeklyReport = z.infer<typeof weeklyReportSchema>;
export type ProjectProgress = z.infer<typeof projectProgressSchema>;
export type LearningEntry = z.infer<typeof learningEntrySchema>;
