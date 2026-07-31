/**
 * FE-08: A shared, machine-readable error protocol between the chat route and
 * the client. The AI SDK surfaces non-2xx responses and mid-stream errors as a
 * plain `Error` whose `message` is the raw response body / `errorText`. We
 * encode a small envelope in that string and decode it on the client so each
 * failure case maps to its own designed UI component.
 *
 * No raw JSON or stack traces are ever shown to the user.
 */

export const ERROR_CODES = [
  'rate_limit',
  'network',
  'stream',
  'server',
  'tool',
  'unknown',
] as const;

export type ChatErrorKind = (typeof ERROR_CODES)[number];

export interface ChatErrorInfo {
  /** The machine-readable failure category. */
  kind: ChatErrorKind;
  /** A human-friendly, safe-to-display message. */
  message: string;
  /** Seconds to wait before retrying (rate limit). */
  retryAfter?: number;
}

const FALLBACK_MESSAGES: Record<ChatErrorKind, string> = {
  rate_limit: "You've reached today's request limit.",
  network: 'We lost connection while generating your response.',
  stream: 'We lost connection while generating your response.',
  server: 'Something went wrong on our end. Please try again.',
  tool: 'The tool hit an unexpected issue.',
  unknown: 'Something went wrong. Please try again.',
};

const ENVELOPE_RE = /^\[RS_ERR\](.+)$/;

/**
 * Server helper: wrap a failure into the envelope string that the AI SDK will
 * surface as `error.message` on the client.
 */
export function errorEnvelope(
  kind: ChatErrorKind,
  message: string,
  extra: { retryAfter?: number } = {},
): string {
  return `[RS_ERR]${JSON.stringify({
    code: kind,
    message,
    retryAfter: extra.retryAfter,
  })}`;
}

/** Client helper: classify an arbitrary thrown value into a known failure case. */
export function classifyError(error: unknown): ChatErrorInfo {
  const message = error instanceof Error ? error.message : String(error ?? '');

  const parsed = parseEnvelope(message);
  if (parsed) {
    return {
      kind: parsed.code,
      message: parsed.message || FALLBACK_MESSAGES[parsed.code],
      retryAfter: parsed.retryAfter,
    };
  }

  if (/failed to fetch|networkerror|load failed|network/i.test(message)) {
    return { kind: 'network', message: FALLBACK_MESSAGES.network };
  }
  if (/rate.?limit|429|too many requests/i.test(message)) {
    return { kind: 'rate_limit', message: FALLBACK_MESSAGES.rate_limit };
  }

  return { kind: 'unknown', message: FALLBACK_MESSAGES.unknown };
}

function parseEnvelope(message: string): {
  code: ChatErrorKind;
  message?: string;
  retryAfter?: number;
} | null {
  if (!message) return null;
  const match = message.match(ENVELOPE_RE);
  const raw = match ? match[1] : message;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const record = parsed as { code?: unknown; message?: unknown; retryAfter?: unknown };
      if (
        typeof record.code === 'string' &&
        (ERROR_CODES as readonly string[]).includes(record.code)
      ) {
        return {
          code: record.code as ChatErrorKind,
          message: typeof record.message === 'string' ? record.message : undefined,
          retryAfter:
            typeof record.retryAfter === 'number' ? record.retryAfter : undefined,
        };
      }
    }
  } catch {
    // Not our envelope — fall through to heuristics.
  }
  return null;
}
