// ===========================================================================
// Transaction stage model
// ---------------------------------------------------------------------------
// Why this exists: user feedback, repeatedly and at 2 stars.
//
//   "Proof generation took almost 25 seconds on my Android phone and the
//    screen froze without showing a progress bar. I almost closed the tab
//    thinking the app crashed."
//   "Show a step-by-step progress indicator (Witness -> Proving -> Submitting)
//    during vote creation so the user knows what step is computing."
//
// A single indeterminate spinner cannot distinguish "proving on your CPU" from
// "waiting for you to click sign" from "waiting for the chain" — and on a slow
// device the difference between those is the difference between waiting and
// force-quitting. The provider bridge already narrates its own steps as free
// text (see `onProviderProgress`); this module turns that text into a small
// closed set of stages the UI can render as a checklist.
//
// Deliberately a mapper over the existing strings rather than new callbacks
// threaded through the SDK: the SDK drives balancing and submission
// internally, so its own narration is the only ground truth we get.
// ===========================================================================

/** Ordered stages a write transaction passes through. */
export const TX_STAGES = ['checking', 'proving', 'signing', 'submitting', 'confirming'] as const;

export type TxStage = (typeof TX_STAGES)[number];

export interface StageMeta {
  /** Short label for the checklist row. */
  label: string;
  /** One line explaining what the machine is doing, in plain English. */
  detail: string;
}

export const STAGE_META: Record<TxStage, StageMeta> = {
  checking: {
    label: 'Checking your balance',
    detail: 'Making sure you have enough DUST to pay the fee before anything else runs.',
  },
  proving: {
    label: 'Generating zero-knowledge proof',
    detail: 'Your device is proving the vote is valid without revealing your choice.',
  },
  signing: {
    label: 'Waiting for your signature',
    detail: 'Approve the transaction in your wallet.',
  },
  submitting: {
    label: 'Submitting to Midnight',
    detail: 'Broadcasting the signed transaction to the network.',
  },
  confirming: {
    label: 'Waiting for confirmation',
    detail: 'The network is including your transaction in a block.',
  },
};

export function stageIndex(stage: TxStage): number {
  return TX_STAGES.indexOf(stage);
}

/**
 * Map one provider progress line onto a stage.
 *
 * Returns null for lines that do not move the user-visible stage — the bridge
 * logs far more detail than a voter needs, and advancing on every line would
 * make the checklist flicker.
 */
export function stageFromProgress(step: string): TxStage | null {
  const s = step.toLowerCase();

  // Proving runs BEFORE the wallet prompt and is the slowest phase, so it is
  // checked first: its own message is the one users were staring at.
  if (s.includes('zero-knowledge proof') || s.includes('proving')) return 'proving';
  if (s.includes('balancing transaction') || s.includes('approve in your wallet')) return 'signing';
  if (s.includes('balanced')) return 'submitting';
  if (s.includes('submitting transaction')) return 'submitting';
  if (s.includes('waiting for finalization') || s.includes('submitted —')) return 'confirming';

  return null;
}
