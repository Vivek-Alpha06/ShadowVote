// ===========================================================================
// Activity log
// ---------------------------------------------------------------------------
// A timestamped, copyable record of every step of a chain operation, shown in
// the UI rather than only in devtools.
//
// The SDK drives proving, balancing and submission internally and swallows a
// lot of detail, so when something stalls the only honest way to find out
// where is to record each phase as it happens.
// ===========================================================================

export interface LogEntry {
  at: number;
  /** Milliseconds since the operation started. */
  elapsed: number;
  level: 'info' | 'error';
  message: string;
}

const entries: LogEntry[] = [];
const listeners = new Set<() => void>();
let startedAt = Date.now();

export function getLog(): readonly LogEntry[] {
  return entries;
}

export function subscribeLog(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Mirror the log to the dev server, which writes it to
 * frontend/shadowvote-debug.log. Lets a stall be diagnosed from the repo
 * instead of asking whoever is at the browser to copy console output.
 * Dev only, and failures here are ignored — this must never affect the app.
 */
function ship(text: string, reset = false): void {
  // Dev only. `import.meta.env` isn't in the tsconfig lib here, so read it
  // defensively rather than adding vite/client types just for this.
  const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV ?? false;
  if (!dev) return;
  void fetch('/__shadowvote-log', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ reset, text }),
    keepalive: true,
  }).catch(() => {});
}

export function resetLog(): void {
  entries.length = 0;
  startedAt = Date.now();
  ship(`user agent: ${navigator.userAgent}\norigin: ${window.location.origin}`, true);
  listeners.forEach((fn) => fn());
}

function push(level: LogEntry['level'], message: string): void {
  const now = Date.now();
  const elapsed = now - startedAt;
  entries.push({ at: now, elapsed, level, message });
  // Mirror to the console so it survives even if the UI unmounts.
  (level === 'error' ? console.error : console.info)('[ShadowVote]', message);
  ship(`[${(elapsed / 1000).toFixed(1)}s] ${level === 'error' ? 'ERROR ' : ''}${message}`);
  listeners.forEach((fn) => fn());
}

export function logStep(message: string): void {
  push('info', message);
}

/**
 * Fully describe a thrown value.
 *
 * DApp connector errors are `Error & { type, code, reason }` and their
 * `message` is frequently EMPTY — the real cause lives in `code`/`reason`.
 * Reading only `message` reports "Error:" and discards the diagnosis, so walk
 * every own property and the cause chain instead.
 */
export function describeThrown(cause: unknown): string {
  if (cause === undefined || cause === null) return String(cause);
  if (typeof cause !== 'object') return String(cause);

  const err = cause as Record<string, unknown> & { message?: string; name?: string };
  const parts: string[] = [];

  // `name`/`message` are ordinary properties on a thrown object and may be
  // getters that throw, so even these two need guarding — otherwise the
  // describer dies and takes the diagnosis with it.
  for (const key of ['name', 'message'] as const) {
    try {
      if (err[key]) parts.push(String(err[key]));
    } catch {
      parts.push(`${key}=<threw>`);
    }
  }

  // Everything else that isn't noise — this is where code/reason/type live.
  const skip = new Set(['name', 'message', 'stack']);
  for (const key of Object.getOwnPropertyNames(err)) {
    if (skip.has(key)) continue;
    const value = err[key];
    if (value === undefined || typeof value === 'function') continue;
    if (key === 'cause') continue; // handled below
    try {
      parts.push(`${key}=${typeof value === 'object' ? JSON.stringify(value) : String(value)}`);
    } catch {
      parts.push(`${key}=<unserializable>`);
    }
  }

  if (parts.length === 0) {
    try {
      parts.push(JSON.stringify(cause));
    } catch {
      parts.push(Object.prototype.toString.call(cause));
    }
  }

  const nested = (err as { cause?: unknown }).cause;
  if (nested !== undefined && nested !== cause) {
    parts.push(`caused by → ${describeThrown(nested)}`);
  }

  return parts.join(' | ');
}

export function logError(message: string, cause?: unknown): void {
  let detail = '';
  try {
    detail = cause === undefined ? '' : describeThrown(cause);
  } catch (err) {
    detail = `<describeThrown failed: ${String(err)}>`;
  }

  // Emitted as ONE entry, deliberately. These used to be two pushes, and each
  // push is mirrored to disk by an independent fire-and-forget request — so a
  // dropped or reordered request could land the stack while losing the line
  // that actually names the failure, which is exactly what happened to the
  // 2026-08-14 submitTransaction() error. One entry cannot be half-delivered.
  const stack =
    cause instanceof Error && cause.stack
      ? '\n' + cause.stack.split('\n').slice(1, 5).join('\n')
      : '';

  push('error', (detail ? `${message} — ${detail}` : message) + stack);
}

/** Time an awaited step, so a stall shows up as a long-running entry. */
export async function timed<T>(label: string, run: () => Promise<T>): Promise<T> {
  logStep(`▶ ${label}`);
  const t0 = Date.now();
  try {
    const result = await run();
    logStep(`✓ ${label} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    return result;
  } catch (err) {
    logError(`✗ ${label} (${((Date.now() - t0) / 1000).toFixed(1)}s)`, err);
    // Re-throw with the real diagnosis attached, so the UI shows it too rather
    // than an empty "Error:".
    if (err instanceof Error && !err.message) {
      const wrapped = new Error(`${label} failed — ${describeThrown(err)}`);
      // `cause` via the Error options arg needs the ES2022 lib; assign it.
      (wrapped as Error & { cause?: unknown }).cause = err;
      throw wrapped;
    }
    throw err;
  }
}

/** Plain-text dump for the copy button. */
export function formatLog(): string {
  return entries
    .map((e) => `[${(e.elapsed / 1000).toFixed(1)}s] ${e.level === 'error' ? 'ERROR ' : ''}${e.message}`)
    .join('\n');
}
