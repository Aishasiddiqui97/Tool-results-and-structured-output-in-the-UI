'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ScanSearch } from 'lucide-react';
import type { AnalyzeResumePart } from '@/lib/chat';
import { ToolInputStreaming } from './ToolInputStreaming';
import { ToolInputAvailable } from './ToolInputAvailable';
import { ToolOutputCard } from './ToolOutputCard';
import { ToolErrorState } from './ToolErrorState';

const STATUS_META = {
  'input-streaming': {
    label: 'Running',
    className: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
    dot: true,
  },
  'input-available': {
    label: 'Input captured',
    className: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
    dot: false,
  },
  'output-available': {
    label: 'Complete',
    className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    dot: false,
  },
  'output-error': {
    label: 'Failed',
    className: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    dot: false,
  },
} as const;

function renderBody(part: AnalyzeResumePart, onRetry: () => void) {
  switch (part.state) {
    case 'input-streaming':
      return <ToolInputStreaming />;
    case 'input-available':
      return <ToolInputAvailable resumeText={part.input.resumeText} />;
    case 'output-available':
      return part.output ? (
        <ToolOutputCard output={part.output} />
      ) : (
        <ToolInputStreaming />
      );
    case 'output-error':
      return <ToolErrorState errorText={part.errorText} onRetry={onRetry} />;
  }
}

export function ToolCallCard({
  part,
  onRetry,
}: {
  part: AnalyzeResumePart;
  onRetry: () => void;
}) {
  const meta = STATUS_META[part.state];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/25 backdrop-blur">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-400/10 text-indigo-300">
          <ScanSearch className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Tool call
          </p>
          <p className="truncate font-mono text-sm font-medium text-slate-200">
            analyzeResume
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.className}`}
        >
          {meta.dot && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {meta.label}
        </span>
      </div>

      <div className="relative min-h-[150px] p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={part.state}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderBody(part, onRetry)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
