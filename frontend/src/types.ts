// Shared domain types for ShadowVote.

export type ElectionStatus = 'OPEN' | 'CLOSED';

export interface Candidate {
  index: number;
  name: string;
}

/**
 * What kind of vote this is. Presentation only — the contract treats every
 * election identically; this rides along in the packed metadata.
 */
export type ElectionCategory = 'election' | 'survey' | 'poll' | 'referendum' | 'governance' | 'other';

export const ELECTION_CATEGORIES: { value: ElectionCategory; label: string; icon: string }[] = [
  { value: 'election', label: 'Election', icon: '🗳️' },
  { value: 'survey', label: 'Survey', icon: '📋' },
  { value: 'poll', label: 'Poll', icon: '📊' },
  { value: 'referendum', label: 'Referendum', icon: '⚖️' },
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export function categoryMeta(c: ElectionCategory | undefined) {
  return ELECTION_CATEGORIES.find((x) => x.value === c) ?? ELECTION_CATEGORIES[0];
}

export interface Election {
  id: string;
  name: string;
  description: string;
  /** Defaults to 'election' for records created before categories existed. */
  category: ElectionCategory;
  candidates: Candidate[];
  organizer: string; // organizer commitment (public)
  createdAt: number; // epoch ms
  endTime: number; // epoch ms
  status: ElectionStatus;
  totalVotes: number;
}

export interface CandidateResult {
  index: number;
  name: string;
  votes: number;
}

export interface ElectionResults {
  electionId: string;
  /** Turnout is public throughout — it leaks nothing about choices. */
  totalVotes: number;
  status: ElectionStatus;
  endTime: number;
  /** False until voting has ended; per-candidate tallies stay sealed until then. */
  revealed: boolean;
  /** null while sealed. */
  results: CandidateResult[] | null;
  /** null while sealed, when nobody voted, or on a tie. */
  winner: CandidateResult | null;
}

export interface CreateElectionInput {
  name: string;
  description: string;
  category: ElectionCategory;
  candidateNames: string[];
  endTime: number; // epoch ms
}
