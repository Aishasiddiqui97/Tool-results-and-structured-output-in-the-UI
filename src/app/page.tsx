'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  ArrowUp,
  Clipboard,
  FileSearch,
  Loader2,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { AppMessage } from '@/lib/chat';
import { sampleResumes } from '@/lib/sampleResumes';
import { ChatMessage } from '@/components/ChatMessage';

export default function Home() {
  const { messages, status, error, sendMessage, regenerate, clearError } =
    useChat<AppMessage>({
      onError: (err) => {
        console.error('Chat error:', err);
      },
    });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const busy = status === 'submitted' || status === 'streaming';

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    void sendMessage({ text });
    setInput('');
  };

  const handleRetry = (messageId: string) => {
    void regenerate({ messageId });
  };

  const hasStreamingTool = messages.some((message) =>
    message.parts.some(
      (part) =>
        part.type === 'tool-analyzeResume' &&
        (part.state === 'input-streaming' || part.state === 'input-available'),
    ),
  );
  const showTyping = busy && !hasStreamingTool;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -z-10 h-[60%] w-1/2 -translate-y-1/3 bg-[radial-gradient(40%_60%_at_80%_40%,rgba(16,185,129,0.08),transparent)]"
      />

      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <FileSearch className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-100">ResumeScope</h1>
            <p className="text-[11px] text-slate-500">AI resume analysis · FE-07</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              busy
                ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${busy ? 'animate-pulse bg-current' : 'bg-current'}`}
            />
            {busy ? 'Analyzing' : 'Ready'}
          </span>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/30">
                <Sparkles className="h-8 w-8" />
              </span>
              <h2 className="max-w-md text-xl font-semibold text-slate-100">
                Paste a resume, get an AI-powered score
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                The <span className="font-mono text-slate-300">analyzeResume</span> tool runs
                server-side, validates its input with Zod, and streams its lifecycle — input,
                result, or error — right into the UI.
              </p>
              <div className="mt-8 grid w-full max-w-lg gap-3 sm:grid-cols-2">
                {sampleResumes.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => setInput(sample.text)}
                    className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-indigo-400/40 hover:bg-white/[0.06]"
                  >
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Clipboard className="h-3.5 w-3.5 text-indigo-300" />
                      {sample.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {sample.description}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-indigo-300 opacity-0 transition group-hover:opacity-100">
                      Load sample →
                    </p>
                  </button>
                ))}
              </div>
              <p className="mt-8 text-[11px] text-slate-600">
                The “Trigger tool error” sample demonstrates the designed error state + retry flow.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={handleRetry}
                />
              ))}
              {showTyping && (
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/15 text-indigo-300">
                    <FileSearch className="h-4 w-4" />
                  </span>
                  <div className="flex h-9 items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${dot * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          {error ? (
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-rose-200">Request failed</p>
                <p className="text-[11px] text-rose-200/70">
                  {error.message ?? 'Something went wrong sending your message.'} Check your API
                  key and try again.
                </p>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="rounded-md p-1 text-rose-300 transition hover:bg-rose-400/20"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Paste a resume or ask the assistant…"
              className="max-h-40 min-h-[46px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || busy}
              aria-label="Send message"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition enabled:hover:from-indigo-400 enabled:hover:to-violet-500 disabled:opacity-40 disabled:shadow-none"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-600">
            Enter to send · Shift + Enter for a new line · Powered by the Vercel AI SDK
          </p>
        </div>
      </footer>
    </div>
  );
}
