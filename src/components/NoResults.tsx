'use client';

import { SearchX } from 'lucide-react';
import { EmptyState } from './EmptyState';

/**
 * No-results empty state — shown when an assistant turn produces no output
 * (no text, no tool result). Offers a clean restart so the user can try a
 * different search / prompt.
 */
export function NoResults({
  onTryAgain,
  message = 'The assistant didn&apos;t produce any results for that request.',
}: {
  onTryAgain: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon={SearchX}
      iconClassName="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-amber-500/10"
      title="No matching results found."
      description={message}
    >
      <button
        type="button"
        onClick={onTryAgain}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        Try another search
      </button>
    </EmptyState>
  );
}
