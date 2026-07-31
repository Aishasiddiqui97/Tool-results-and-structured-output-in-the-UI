'use client';

import { Clipboard, MessageSquarePlus, Sparkles } from 'lucide-react';
import { EmptyState } from './EmptyState';
import type { SampleResume } from '@/lib/sampleResumes';

const PROMPT_CHIPS = [
  { id: 'resume', label: 'Review my resume', icon: Clipboard },
  { id: 'website', label: 'Analyze this website', icon: MessageSquarePlus },
  { id: 'article', label: 'Summarize this article', icon: Sparkles },
];

/**
 * First-run empty conversation screen. Clicking a prompt chip (or a sample
 * resume card) fills the composer so the user can send with one keystroke.
 */
export function FirstRun({
  onPrompt,
  sampleResumes,
}: {
  onPrompt: (text: string) => void;
  sampleResumes: SampleResume[];
}) {
  return (
    <EmptyState
      icon={Sparkles}
      title="Start your first conversation"
      description="Paste a resume, ask for feedback, or just say hi. The AI assistant streams structured analysis right into the chat."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PROMPT_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onPrompt(chip.label)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Icon className="h-3.5 w-3.5 text-indigo-300" />
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          {sampleResumes.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onPrompt(sample.text)}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-indigo-400/40 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Clipboard className="h-3.5 w-3.5 text-indigo-300" />
                {sample.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {sample.description}
              </p>
              <p className="mt-2 text-[11px] font-medium text-indigo-300 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                Load sample →
              </p>
            </button>
          ))}
        </div>
      </div>
    </EmptyState>
  );
}
