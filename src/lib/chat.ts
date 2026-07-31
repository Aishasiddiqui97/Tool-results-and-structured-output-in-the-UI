import type { UIDataTypes, UIMessage } from 'ai';
import type { AnalyzeResumeOutput } from '@/tools/analyzeResume';

/**
 * End-to-end typed tool map shared between the client UI and the tool
 * definition on the server. AI SDK v5 uses these types to give tool parts
 * (`tool-analyzeResume`) fully typed input/output on the client.
 */
export type Tools = {
  analyzeResume: {
    input: { resumeText: string };
    output: AnalyzeResumeOutput;
  };
};

export type AppMessage = UIMessage<unknown, UIDataTypes, Tools>;

/** The typed tool part for `analyzeResume` inside an assistant message. */
export type AnalyzeResumePart = Extract<
  AppMessage['parts'][number],
  { type: 'tool-analyzeResume' }
>;

export type ToolInvocationState = AnalyzeResumePart['state'];
