'use client';

import { Bot, RefreshCw, User } from 'lucide-react';
import type { AppMessage } from '@/lib/chat';
import { ToolCallCard } from './ToolCallCard';

export function ChatMessage({
  message,
  onRetry,
  isStreaming = false,
  isStopped = false,
  onRegenerateStopped,
}: {
  message: AppMessage;
  onRetry: (messageId: string) => void;
  /** Whether this assistant message is currently receiving streamed parts. */
  isStreaming?: boolean;
  /** Whether generation was cancelled mid-way by the user. */
  isStopped?: boolean;
  onRegenerateStopped?: (messageId: string) => void;
}) {
  if (message.role === 'user') {
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20">
          <div className="whitespace-pre-wrap break-words">{text}</div>
        </div>
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400">
          <User className="h-4 w-4" />
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3"
      aria-live={isStreaming ? 'polite' : 'off'}
      aria-atomic={isStreaming ? 'false' : undefined}
    >
      <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/15 text-indigo-300">
        <Bot className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        {message.parts.map((part, index) => {
          switch (part.type) {
            case 'text':
              return part.text ? (
                <div
                  key={index}
                  className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200"
                >
                  {part.text}
                </div>
              ) : null;
            case 'step-start':
              return index > 0 ? (
                <div key={index} className="flex items-center gap-2 py-1">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
                    tool step
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              ) : null;
            case 'tool-analyzeResume':
              return (
                <ToolCallCard
                  key={part.toolCallId}
                  part={part}
                  onRetry={() => onRetry(message.id)}
                />
              );
            default:
              return null;
          }
        })}

        {isStopped ? (
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Generation stopped
            </span>
            {onRegenerateStopped ? (
              <button
                type="button"
                onClick={() => onRegenerateStopped(message.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300 transition hover:bg-indigo-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
