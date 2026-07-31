'use client';

import { motion } from 'framer-motion';
import { Square, Timer } from 'lucide-react';

/**
 * Shown when a response takes longer than SLOW_MS to produce any content.
 * Replaces the plain typing indicator with reassurance, an estimated progress
 * bar, and a stop control.
 */
export function SlowResponse({
  elapsedMs,
  onStop,
}: {
  elapsedMs: number;
  onStop: () => void;
}) {
  // An optimistic, capped estimate — never claims to be precise.
  const progress = Math.min(92, Math.round((elapsedMs / 30000) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/15 text-indigo-300">
        <Timer className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                style={{ animationDelay: `${dot * 140}ms` }}
              />
            ))}
          </span>
          <p className="text-sm font-medium text-slate-200">Still thinking…</p>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          This can take a while on complex requests. Thanks for your patience.
        </p>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1.5 text-[10px] tabular-nums text-slate-600">
          {progress}% estimated
        </p>

        <button
          type="button"
          onClick={onStop}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:bg-white/[0.08] hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <Square className="h-3 w-3" />
          Stop Generation
        </button>
      </div>
    </motion.div>
  );
}
