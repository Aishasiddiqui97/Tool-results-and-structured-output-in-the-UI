'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LifeBuoy, RefreshCw } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/**
 * Dedicated tool-failure card. Renders inside the tool part when a tool's
 * `execute` throws, so the whole app never crashes. Includes the tool name,
 * a friendly explanation, and a retry that re-runs the failed step.
 */
export function ToolErrorCard({
  toolName,
  errorText,
  onRetry,
}: {
  toolName: string;
  errorText?: string;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="relative mt-0.5 shrink-0">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/25" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <motion.div variants={item} className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-100">Tool failed</p>
            <code className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-indigo-300">
              {toolName}
            </code>
          </motion.div>
          <motion.p variants={item} className="mt-1 text-xs leading-relaxed text-slate-400">
            The <span className="font-mono text-slate-300">{toolName}</span> tool hit an
            unexpected issue and couldn&apos;t finish. No data was lost — retry the tool or
            send a new message.
          </motion.p>
        </div>
      </div>

      {errorText ? (
        <motion.div variants={item} className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2">
          <button
            type="button"
            onClick={() => setShowDetails((current) => !current)}
            aria-expanded={showDetails}
            className="flex w-full items-center justify-between text-[11px] font-medium uppercase tracking-wider text-rose-300/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            What went wrong
            <span aria-hidden className="text-xs">{showDetails ? '−' : '+'}</span>
          </button>
          <AnimatePresence initial={false}>
            {showDetails ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-rose-200/90">
                  {errorText}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}

      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Tool
        </button>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <LifeBuoy className="h-3.5 w-3.5" />
          Your conversation stays intact
        </span>
      </motion.div>
    </motion.div>
  );
}
