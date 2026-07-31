'use client';

import Link from 'next/link';
import { FileSearch } from 'lucide-react';
import { ErrorState } from '@/components/ErrorState';

/**
 * Next.js error boundary (FE-08). Catches runtime errors from the page tree
 * and shows a friendly, recoverable screen instead of a crash.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Page error boundary:', error);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.16),transparent)]"
      />
      <header className="relative shrink-0 border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <FileSearch className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-100">ResumeScope</h1>
            <p className="text-[11px] text-slate-500">AI resume analysis</p>
          </div>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4">
        <ErrorState
          fullPage
          title="Something went wrong"
          message="An unexpected error interrupted your session. Your conversation is safe — retry the page or head back to the start."
          onRetry={reset}
          onBackToHome={undefined}
        />
      </div>
      <p className="pb-6 text-center text-[11px] text-slate-600">
        <Link
          href="/"
          className="font-medium text-indigo-300 underline-offset-4 transition hover:text-indigo-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Back to Home
        </Link>
      </p>
    </main>
  );
}
