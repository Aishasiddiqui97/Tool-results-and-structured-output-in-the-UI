'use client';

import type { AnalyzeResumeOutput } from '@/tools/analyzeResume';
import { ResumeScoreCard } from './ResumeScoreCard';

/**
 * Renders the real result UI for a completed tool call.
 * For `analyzeResume` this is the ResumeScoreCard — never raw JSON.
 * Add a case here for any future tool's structured output.
 */
export function ToolOutputCard({ output }: { output: AnalyzeResumeOutput }) {
  return <ResumeScoreCard output={output} />;
}
