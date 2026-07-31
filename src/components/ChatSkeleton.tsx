'use client';

/**
 * FE-08 skeleton components. Each one mirrors the final layout of the
 * component it stands in for, so swapping skeleton → content does not shift
 * the layout or cause scroll jumps.
 */

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-full bg-white/[0.07] ${className}`}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
    </div>
  );
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden rounded-2xl bg-white/[0.05] ${className}`}
    >
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
    </div>
  );
}

/** Skeleton for a single assistant message (bot avatar + text lines). */
export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3" aria-hidden>
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/15" />
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <SkeletonLine className="h-3.5 w-2/3 max-w-xs" />
        <SkeletonLine className="h-3.5 w-11/12" />
        <SkeletonLine className="h-3.5 w-4/5" />
      </div>
    </div>
  );
}

/** Skeleton for the `analyzeResume` tool card (header + body). */
export function ToolSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/25" aria-hidden>
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2.5">
        <span className="h-8 w-8 rounded-lg bg-indigo-400/15" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonLine className="h-2 w-14" />
          <SkeletonLine className="h-3 w-28" />
        </div>
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-12 w-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-3.5 w-2/3" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-full" />
          <SkeletonLine className="h-3 w-5/6" />
          <SkeletonLine className="h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the animated score card (ring + columns + chips). */
export function ScoreCardSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <SkeletonBlock className="h-[140px] w-[140px] rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonLine className="h-4 w-36" />
          <SkeletonLine className="h-3 w-24" />
          <SkeletonBlock className="h-1.5 w-full max-w-xs rounded-full" />
          <SkeletonLine className="h-3 w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonBlock className="h-40 p-4" />
        <SkeletonBlock className="h-40 p-4" />
      </div>
      <SkeletonBlock className="h-24 p-4" />
    </div>
  );
}

/** Full-page skeleton used as the Suspense fallback for the chat viewport. */
export function ChatSkeleton() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden" aria-hidden>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <span className="h-9 w-9 rounded-xl bg-indigo-500/25" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine className="h-3.5 w-28" />
          <SkeletonLine className="h-2.5 w-40" />
        </div>
        <SkeletonLine className="h-5 w-20 rounded-full" />
      </div>

      <div className="flex-1 overflow-hidden px-4 py-6">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-end space-y-6">
          <div className="flex justify-end">
            <SkeletonBlock className="h-11 w-2/3 max-w-sm rounded-2xl" />
          </div>
          <MessageSkeleton />
          <ToolSkeleton />
          <MessageSkeleton />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-slate-950/70 px-4 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
          <SkeletonBlock className="h-[46px] flex-1 rounded-xl" />
          <SkeletonBlock className="h-[46px] w-[46px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
