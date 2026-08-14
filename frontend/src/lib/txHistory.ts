// ===========================================================================
// Transaction history
// ---------------------------------------------------------------------------
// Every on-chain transaction this app submits, kept per wallet and PERSISTED.
//
// The previous log was a module-level array, so a reload erased it. That made
// the hashes nearly useless: a transaction is the one durable receipt a user
// has, and it is worth least at the moment they most want it — after the tab
// was closed.
//
// Scoped by the wallet's coin public key so switching accounts shows that
// account's own history rather than a merged pile.
// ===========================================================================

const PREFIX = 'shadowvote:txhistory:';
const MAX_PER_WALLET = 200;

export interface TxRecord {
  hash: string;
  /** Human label, e.g. "Cast vote". */
  action: string;
  /** Epoch ms. */
  at: number;
  /** Network the transaction was submitted to — explorer links are per-network. */
  networkId?: string;
  /** Election this relates to, when applicable. */
  electionId?: string;
}

const listeners = new Set<() => void>();

export function subscribeTxHistory(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(): void {
  listeners.forEach((fn) => fn());
}

/** localStorage key for a wallet. Falls back to a shared bucket if unknown. */
function keyFor(wallet: string | null | undefined): string {
  return PREFIX + (wallet && wallet.length > 0 ? wallet : 'unknown');
}

export function readTxHistory(wallet: string | null | undefined): TxRecord[] {
  try {
    const raw = localStorage.getItem(keyFor(wallet));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is TxRecord =>
        !!r && typeof (r as TxRecord).hash === 'string' && typeof (r as TxRecord).at === 'number',
    );
  } catch {
    // Corrupt or unreadable history must never break the app.
    return [];
  }
}

export function addTxRecord(wallet: string | null | undefined, record: TxRecord): void {
  if (!record.hash) return;
  const existing = readTxHistory(wallet);
  // A hash is unique; guard against double-recording the same submission.
  if (existing.some((r) => r.hash === record.hash)) return;
  const next = [record, ...existing].slice(0, MAX_PER_WALLET);
  try {
    localStorage.setItem(keyFor(wallet), JSON.stringify(next));
  } catch {
    /* quota exceeded — history is a convenience, never a hard failure */
  }
  emit();
}

export function clearTxHistory(wallet: string | null | undefined): void {
  localStorage.removeItem(keyFor(wallet));
  emit();
}
