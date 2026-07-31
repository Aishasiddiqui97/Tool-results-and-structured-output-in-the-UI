/**
 * FE-08: Development-only simulated failure switches.
 *
 * Append one of these to the URL to force a specific failure path end-to-end:
 *
 *   ?test=network   simulate a client-side fetch failure (before sending)
 *   ?test=429       simulate an HTTP 429 rate limit (before streaming)
 *   ?test=stream    simulate a mid-stream connection loss
 *   ?test=tool      simulate a tool execution failure
 *   ?test=server    simulate an unexpected server exception
 */

export const TEST_MODES = ['network', '429', 'stream', 'tool', 'server'] as const;

export type TestMode = (typeof TEST_MODES)[number];

export function isTestMode(value: string | null | undefined): value is TestMode {
  return value != null && (TEST_MODES as readonly string[]).includes(value);
}
