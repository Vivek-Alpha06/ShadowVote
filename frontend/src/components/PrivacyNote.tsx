// Reusable "what is public vs private" explainer — a core UX requirement.
//
// The jargon note below exists because of user feedback:
//
//   "The term Nullifier was confusing for non-technical users in our group.
//    Adding a short 1-line tooltip explaining it is an anonymous voting ticket
//    would help."  -- Sharmistha Guha, 3 stars
//
// The word appears in the app, in the explorer and in every explanation of how
// the privacy guarantee works, so it cannot simply be removed — but it can be
// defined in one sentence at the place people meet it.
export default function PrivacyNote() {
  return (
    <div className="glass p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-100">
        <span>🛡️</span> What stays private
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Public — anyone can verify
          </p>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Election exists &amp; its metadata</li>
            <li>• That a vote was submitted</li>
            <li>• Final tallies &amp; winner</li>
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
            Private — nobody can see
          </p>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Which candidate you chose</li>
            <li>• Your wallet ↔ vote link</li>
            <li>• Your voting history</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 border-t border-white/5 pt-3 text-xs text-slate-500">
        <span
          className="font-semibold text-slate-300 underline decoration-dotted underline-offset-2"
          title="A one-way fingerprint of (this election, you). It stops you voting twice here, is a completely different value in every other election, and cannot be traced back to your wallet."
        >
          Nullifier
        </span>{' '}
        — the word you'll see on the explorer. Think of it as an{' '}
        <span className="text-slate-300">anonymous voting ticket</span>: it proves this election has
        already counted you, without saying who you are or what you chose. You get a different,
        unlinkable ticket in every other election.
      </p>
    </div>
  );
}
