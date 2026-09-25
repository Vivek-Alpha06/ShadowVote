export function shortAddress(addr: string, lead = 6, tail = 4): string {
  if (addr.length <= lead + tail) return addr;
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`;
}

export function timeLeft(endTime: number): string {
  const ms = endTime - Date.now();
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  if (m > 0) return `${m}m ${sec}s left`;
  return `${sec}s left`;
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * The atomic unit of DUST. 1 DUST = 10^15 SPECK, per the Midnight glossary —
 * the same relationship as 1 NIGHT = 10^6 STAR, just far finer grained.
 */
export const SPECK_PER_DUST = 10n ** 15n;

/**
 * A SPECK amount as a human DUST string.
 *
 * Every DUST figure the wallet reports — `getDustBalance().balance`, its `cap`,
 * a transaction fee — is in SPECKs. Printing one unscaled says
 * "1,000,000,000,000,000 DUST" where the user holds a single DUST, which is what
 * the balance chip used to do.
 *
 * BigInt arithmetic throughout, deliberately: 10^15 is beyond the range where a
 * double holds integers exactly, so converting to Number first silently corrupts
 * the low digits of the very amounts being displayed.
 */
export function formatDust(speck: bigint, maxDecimals = 6): string {
  const negative = speck < 0n;
  const abs = negative ? -speck : speck;

  const whole = abs / SPECK_PER_DUST;
  const frac = abs % SPECK_PER_DUST;
  const sign = negative ? '-' : '';

  if (frac === 0n) return `${sign}${whole.toLocaleString()}`;

  // Pad to the full 15 places before truncating, or a fraction like 500 SPECK
  // would read as ".500" rather than ".000000000000500".
  const digits = frac.toString().padStart(15, '0').slice(0, maxDecimals).replace(/0+$/, '');

  if (digits === '') {
    // Non-zero, but finer than the precision shown. Saying "0" would be a lie
    // in the one case that matters most: having just enough to pay a fee.
    return whole === 0n ? `${sign}<0.${'0'.repeat(maxDecimals - 1)}1` : `${sign}${whole.toLocaleString()}`;
  }
  return `${sign}${whole.toLocaleString()}.${digits}`;
}
