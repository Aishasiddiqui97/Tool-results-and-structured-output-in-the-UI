'use client';

import { motion } from 'framer-motion';
import { MessageSquarePlus, RefreshCw, WifiOff, X } from 'lucide-react';

/**
 * Shown when a request fails before or during streaming. "Retry Message"
 * resends only the failed turn (the last user message / incomplete assistant
 * message). "Cancel" dismisses the error and keeps the conversation.
 */
export function RetryBanner({
  title = 'We lost connection while generating your response.',
  message = 'Your conversation is intact. You can retry just the last message or start fresh.',
  onRetry,
  onCancel,
  onNewChat,
}: {
  title?: string;
  message?: string;
  onRetry: () => void;
  onCancel: () => void;
  onNewChat: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="overflow-hidden rounded-2xl border border-rose-400/25 bg-gradient-to-b from-rose-500/[0.08] to-transparent shadow-xl shadow-black/25"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <span className="relative mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-400">
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/20" />
          <WifiOff className="relative h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">Connection lost</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{title}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{message}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Message
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-400 transition hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Start New Chat
        </button>
      </div>
    </motion.div>
  );
}
