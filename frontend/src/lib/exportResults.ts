// ===========================================================================
// Result export
// ---------------------------------------------------------------------------
// User feedback:
//
//   "Tally results cannot be exported. As an organizer, I had to take
//    screenshots because there is no Download as CSV or PDF report button."
//     -- Abhirup Chatterjee, 3 stars
//
//   "Add an export PDF or CSV report button for finalized election results so
//    organizers can share verified tallies with their community."
//     -- Sneha Ghosh
//
// A screenshot of a tally is not evidence of anything — it cannot be checked
// against the chain. So the export carries the contract address and election
// id alongside the numbers, which is what makes a downloaded file verifiable
// by whoever receives it.
//
// Everything exported here is already PUBLIC ledger state. There is no private
// data to leak in a tally: per-voter choices do not exist in any form that
// could be written to a file.
// ===========================================================================

import type { Election, ElectionResults } from '../types';

/** RFC 4180 quoting: wrap in quotes, double any embedded quote. */
function cell(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(cells: (string | number)[]): string {
  return cells.map(cell).join(',');
}

export function resultsToCsv(
  election: Election,
  results: ElectionResults,
  contractAddress: string | null,
): string {
  const ranked = results.results ? [...results.results].sort((a, b) => b.votes - a.votes) : [];
  const total = results.totalVotes;

  const lines: string[] = [
    // A provenance header, so the file can be checked rather than trusted.
    row(['ShadowVote election results']),
    row(['Election', election.name]),
    row(['Election ID', election.id]),
    row(['Contract', contractAddress ?? 'unknown']),
    row(['Status', results.status]),
    row(['Voting ended', new Date(results.endTime).toISOString()]),
    row(['Exported', new Date().toISOString()]),
    row(['Total votes', total]),
    row([]),
    row(['Rank', 'Candidate', 'Votes', 'Share %']),
  ];

  ranked.forEach((r, i) => {
    const share = total > 0 ? ((r.votes / total) * 100).toFixed(2) : '0.00';
    lines.push(row([i + 1, r.name, r.votes, share]));
  });

  lines.push(row([]));
  lines.push(
    row([
      'Note',
      'Tallies are public ledger state. No row in this file identifies a voter, ' +
        'because the link between a wallet and a ballot is never recorded on-chain.',
    ]),
  );

  return lines.join('\r\n');
}

/** Filesystem-safe slug for the download name. */
function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'election'
  );
}

/** Trigger a client-side download. Nothing is uploaded anywhere. */
export function downloadCsv(election: Election, csv: string): void {
  // A BOM keeps Excel from mangling non-ASCII candidate names, which matters
  // for the college and community elections this is actually used for.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `shadowvote-${slug(election.name)}-results.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revoke on the next tick: revoking synchronously can cancel the download
  // in some browsers before it has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
