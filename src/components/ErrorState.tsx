'use client';

import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

/**
 * Designed error screen for unexpected server exceptions and the Next.js
 * error boundary (app/error.tsx). Friendly copy only — never raw errors.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error interrupted your session. Your conversation is safe — you can retry or head back to the start.',
  onRetry,
  onBackToHome,
  fullPage = false,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBackToHome?: () => void;
  /** When true, fills the whole page (used by the error boundary). */
  fullPage?: boolean;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`flex flex-col items-center justify-center px-6 text-center ${
        fullPage ? 'min-h-dvh bg-slate-950 py-16' : 'flex-1 py-12'
      }`}
    >
      <motion.span
        variants={item}
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-400"
      >
        <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/20" />
        <TriangleAlert className="h-8 w-8" />
      </motion.span>

      <motion.h2
        variants={item}
        className="mt-6 max-w-md text-xl font-semibold text-slate-100"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={item}
        className="mt-2 max-w-md text-sm leading-relaxed text-slate-400"
      >
        {message}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
      >
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
        {onBackToHome ? (
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
