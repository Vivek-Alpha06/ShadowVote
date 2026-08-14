// Reusable "what is public vs private" explainer — a core UX requirement.
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
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-shadow-violet">
            Private — nobody can see
          </p>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Which candidate you chose</li>
            <li>• Your wallet ↔ vote link</li>
            <li>• Your voting history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
