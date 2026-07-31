'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  FileSearch,
  MessageSquarePlus,
  Square,
  TriangleAlert,
} from 'lucide-react';
import type { AppMessage } from '@/lib/chat';
import { classifyError } from '@/lib/errors';
import { isTestMode, type TestMode } from '@/lib/testMode';
import { sampleResumes } from '@/lib/sampleResumes';
import { ChatMessage } from './ChatMessage';
import { FirstRun } from './FirstRun';
import { NoResults } from './NoResults';
import { ErrorState } from './ErrorState';
import { RateLimitCard } from './RateLimitCard';
import { RetryBanner } from './RetryBanner';
import { SlowResponse } from './SlowResponse';
import { MessageSkeleton } from './ChatSkeleton';

const SLOW_MS = 3000;

function isEmptyAssistantMessage(message: AppMessage): boolean {
  if (message.role !== 'assistant') return false;
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
    .trim();
  const hasMeaningfulPart = message.parts.some(
    (part) => part.type === 'tool-analyzeResume' || part.type === 'reasoning',
  );
  return !text && !hasMeaningfulPart;
}

export function Chat() {
  const searchParams = useSearchParams();
  const testParam = searchParams.get('test');
  const testMode: TestMode | null = isTestMode(testParam) ? testParam : null;

  // Simulated network failure is injected at the transport layer so it behaves
  // like a real fetch rejection (offline before sending).
  const transport = useMemo(() => {
    const fetchImpl: typeof fetch =
      testMode === 'network'
        ? () => Promise.reject(new TypeError('Failed to fetch'))
        : globalThis.fetch.bind(globalThis);
    return new DefaultChatTransport({ fetch: fetchImpl });
  }, [testMode]);

  const { messages, status, error, sendMessage, regenerate, stop, clearError, setMessages } =
    useChat<AppMessage>({
      transport,
      onError: (err) => {
        console.error('Chat error:', err);
      },
    });

  const [input, setInput] = useState('');
  const [inputHint, setInputHint] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [stoppedMessageId, setStoppedMessageId] = useState<string | null>(null);
  const [slowElapsed, setSlowElapsed] = useState(0);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const busy = status === 'submitted' || status === 'streaming';
  const slow = slowElapsed >= SLOW_MS;
  const errorInfo = error ? classifyError(error) : null;

  const lastMessage = messages[messages.length - 1];
  const streamingAssistant =
    status === 'streaming' && lastMessage?.role === 'assistant';

  // ---- Slow response timer: starts as soon as a request is in flight. ----
  useEffect(() => {
    if (!busy) {
      setSlowElapsed(0);
      return;
    }
    const startedAt = Date.now();
    const id = setInterval(() => setSlowElapsed(Date.now() - startedAt), 250);
    return () => clearInterval(id);
  }, [busy]);

  // ---- Auto-scroll with smooth behavior on every update. ----
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, errorInfo, slow, keyboardInset, scrollToBottom]);

  // ---- Mobile keyboard overlap (visualViewport fallback). ----
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      setKeyboardInset(Math.max(0, window.innerHeight - vv.height));
      requestAnimationFrame(scrollToBottom);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [scrollToBottom]);

  // ---- Screen-reader announcements for streamed messages / errors. ----
  useEffect(() => {
    if (status === 'submitted') setAnnouncement('Assistant is responding.');
    else if (status === 'streaming') setAnnouncement('Assistant is writing a response.');
    else if (status === 'error') setAnnouncement('The response could not be completed.');
    else if (status === 'ready' && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last?.role === 'assistant') setAnnouncement('Response complete.');
    }
  }, [status, messages]);

  // ---- Composer: reject empty submissions with a gentle shake + hint. ----
  const triggerEmptyHint = useCallback(() => {
    setShakeKey(Date.now());
    setInputHint(true);
    window.setTimeout(() => setInputHint(false), 1800);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) {
      triggerEmptyHint();
      return;
    }
    if (busy) return;
    void sendMessage({ text }, { body: { testMode } });
    setInput('');
  }, [input, busy, sendMessage, testMode, triggerEmptyHint]);

  const handleRetry = useCallback(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    // Resend ONLY the failed turn — regenerate truncates everything after it
    // and re-runs through the model.
    void regenerate({ messageId: last.id, body: { testMode } });
  }, [messages, regenerate, testMode]);

  const handleCancelError = useCallback(() => {
    clearError();
  }, [clearError]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    clearError();
    setStoppedMessageId(null);
    setAnnouncement('Started a new chat.');
    inputRef.current?.focus();
  }, [setMessages, clearError]);

  const handleStop = useCallback(async () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) setStoppedMessageId(lastAssistant.id);
    await stop();
  }, [messages, stop]);

  const handleRegenerateStopped = useCallback(
    (messageId: string) => {
      setStoppedMessageId(null);
      void regenerate({ messageId, body: { testMode } });
    },
    [regenerate, testMode],
  );

  const handleTryAnotherSearch = useCallback(() => {
    handleNewChat();
  }, [handleNewChat]);

  const handlePrompt = useCallback(
    (text: string) => {
      setInput(text);
      inputRef.current?.focus();
    },
    [],
  );

  // ---- The "pending area" renders exactly one state below the message list:
  // skeleton while waiting, slow-response after 3s, or the matching error card. ----
  const renderPending = () => {
    if (errorInfo) {
      switch (errorInfo.kind) {
        case 'rate_limit':
          return (
            <RateLimitCard
              message={errorInfo.message}
              retryAfter={errorInfo.retryAfter}
              onRetryLater={handleCancelError}
            />
          );
        case 'network':
        case 'stream':
          return (
            <RetryBanner
              title="We lost connection while generating your response."
              onRetry={handleRetry}
              onCancel={handleCancelError}
              onNewChat={handleNewChat}
            />
          );
        case 'server':
        default:
          return (
            <ErrorState
              title="Something went wrong"
              message={errorInfo.message}
              onRetry={handleRetry}
              onBackToHome={handleNewChat}
            />
          );
      }
    }

    if (busy && slow) {
      return <SlowResponse elapsedMs={slowElapsed} onStop={handleStop} />;
    }

    if (busy && !streamingAssistant) {
      return <MessageSkeleton />;
    }

    return null;
  };

  const pendingKey = errorInfo
    ? `error-${errorInfo.kind}`
    : busy && slow
      ? 'slow'
      : busy && !streamingAssistant
        ? 'skeleton'
        : null;

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden supports-[height:100dvh]:h-dvh"
      style={{ paddingBottom: keyboardInset }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(99,102,241,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -z-10 h-[60%] w-1/2 -translate-y-1/3 bg-[radial-gradient(40%_60%_at_80%_40%,rgba(16,185,129,0.08),transparent)]"
      />

      {/* Visually hidden live region for screen readers. */}
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      <header className="shrink-0 border-b border-white/10">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <FileSearch className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-100">ResumeScope</h1>
            <p className="text-[11px] text-slate-500">AI resume analysis · FE-08</p>
          </div>
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-indigo-400/40 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              New chat
            </button>
          ) : null}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              busy
                ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300'
                : errorInfo
                  ? 'border-rose-400/30 bg-rose-400/10 text-rose-300'
                  : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${busy ? 'animate-pulse bg-current' : 'bg-current'}`}
            />
            {busy ? 'Analyzing' : errorInfo ? 'Error' : 'Ready'}
          </span>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6">
          {messages.length === 0 ? (
            <FirstRun onPrompt={handlePrompt} sampleResumes={sampleResumes} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {isEmptyAssistantMessage(message) && status === 'ready' ? (
                      <NoResults onTryAgain={handleTryAnotherSearch} />
                    ) : (
                      <ChatMessage
                        message={message}
                        onRetry={handleRetry}
                        isStreaming={streamingAssistant && message.id === lastMessage?.id}
                        isStopped={stoppedMessageId === message.id}
                        onRegenerateStopped={handleRegenerateStopped}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {pendingKey ? (
                  <motion.div
                    key={pendingKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {renderPending()}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-slate-950/70 backdrop-blur pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <AnimatePresence>
            {inputHint ? (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden pb-2 text-center text-[11px] text-amber-300/90"
                role="alert"
              >
                Type a message to continue — try a sample resume or a prompt above.
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.div
            key={shakeKey}
            animate={inputHint ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
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
              aria-label="Message"
              className="max-h-40 min-h-[46px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={busy ? handleStop : handleSend}
              disabled={!busy && !input.trim()}
              aria-label={busy ? 'Stop generating' : 'Send message'}
              className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-500/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                busy
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-500/30 hover:from-rose-400 hover:to-rose-500'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-600 enabled:hover:from-indigo-400 enabled:hover:to-violet-500 disabled:opacity-40 disabled:shadow-none'
              }`}
            >
              {busy ? (
                <Square className="h-5 w-5" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </motion.div>
          <p className="mt-2 pb-1 text-center text-[10px] text-slate-600">
            Enter to send · Shift + Enter for a new line · Powered by the Vercel AI SDK
            {testMode ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-amber-300">
                <TriangleAlert className="h-3 w-3" />
                test mode: {testMode}
              </span>
            ) : null}
          </p>
        </div>
      </footer>
    </div>
  );
}
