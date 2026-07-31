'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, LifeBuoy, RefreshCw } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export function ToolErrorState({
  errorText,
  onRetry,
}: {
  errorText?: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <div className="flex items-start gap-4">
        <div className="relative mt-0.5">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/25" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <motion.p variants={item} className="text-sm font-semibold text-slate-100">
            Analysis failed
          </motion.p>
          <motion.p variants={item} className="mt-0.5 text-xs leading-relaxed text-slate-400">
            The resume parser hit an unexpected issue and couldn&apos;t finish scoring. No data
            was lost — you can retry this exact resume or send a new message.
          </motion.p>
        </div>
      </div>

      {errorText ? (
        <motion.div
          variants={item}
          className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-rose-300/80">
            What went wrong
          </p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-rose-200/90">
            {errorText}
          </p>
        </motion.div>
      ) : null}

      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry analysis
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <LifeBuoy className="h-3.5 w-3.5" />
          Your conversation stays intact
        </span>
      </motion.div>
    </motion.div>
  );
}
