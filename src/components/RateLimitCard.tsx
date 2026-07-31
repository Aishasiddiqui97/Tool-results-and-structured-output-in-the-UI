'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Clock, Hourglass, Sparkles } from 'lucide-react';

/**
 * HTTP 429 rate-limit UI. Distinct from every other error card.
 */
export function RateLimitCard({
  message = "You've reached today's request limit.",
  retryAfter,
  onRetryLater,
}: {
  message?: string;
  /** Seconds until the limit resets (optional). */
  retryAfter?: number;
  onRetryLater: () => void;
}) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-500/[0.08] to-transparent shadow-xl shadow-black/25"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div className="relative mt-0.5 shrink-0">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-amber-500/20" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/15 text-amber-300">
            <Hourglass className="h-5 w-5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">Request limit reached</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{message}</p>
          {typeof retryAfter === 'number' ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
              <Clock className="h-3 w-3 text-amber-300" />
              Resets in about {formatDuration(retryAfter)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onRetryLater}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Clock className="h-3.5 w-3.5" />
          Retry Later
        </button>

        <button
          type="button"
          onClick={() => setShowUpgrade((current) => !current)}
          aria-expanded={showUpgrade}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
          Upgrade Plan
        </button>

        <button
          type="button"
          onClick={() => setShowLearnMore((current) => !current)}
          aria-expanded={showLearnMore}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-400 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Learn More
        </button>
      </div>

      <AnimatePresence>
        {showUpgrade ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="border-t border-indigo-400/20 bg-indigo-500/[0.06] px-4 py-3 text-[11px] leading-relaxed text-indigo-200/80 sm:px-5">
              Upgrading removes the daily cap and unlocks higher limits. Billing is a
              placeholder for this project — no real payment is processed.
            </p>
          </motion.div>
        ) : null}
        {showLearnMore ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-slate-400 sm:px-5">
              Request limits protect the service for everyone and keep latency low.
              Limits reset daily — try again in a bit or consider upgrading.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.max(1, Math.round(seconds / 3600));
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}
