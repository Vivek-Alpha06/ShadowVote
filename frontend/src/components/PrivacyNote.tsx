import { ShieldCheck } from 'lucide-react';

export default function PrivacyNote() {
  return (
    <div className="credix-card p-6 bg-white border border-[#cdd0e5] shadow-credix">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2e335b] font-heading">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        <span>Zero-Knowledge Privacy Architecture</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-[#f5f4fd] p-4 rounded-2xl border border-[#cdd0e5]/80">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
            Public — Anyone Can Verify
          </p>
          <ul className="space-y-1 text-xs text-[#2e335b]/75">
            <li>• Election metadata and rules</li>
            <li>• Total voter turnout counter</li>
            <li>• Final decrypted winners and tallies</li>
          </ul>
        </div>
        <div className="bg-[#dfe7f9] p-4 rounded-2xl border border-[#cdd0e5]/80">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#2e335b]">
            Private — Cryptographically Shielded
          </p>
          <ul className="space-y-1 text-xs text-[#2e335b]/75">
            <li>• Candidate choice in private witness</li>
            <li>• Zero link between wallet and choice</li>
            <li>• Complete individual voting confidentiality</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 border-t border-[#cdd0e5]/60 pt-3 text-xs text-[#2e335b]/70 leading-relaxed">
        <span
          className="font-bold text-[#2e335b] underline decoration-dotted underline-offset-2"
          title="A one-way fingerprint of (this election, you). It stops you voting twice here, is a completely different value in every other election, and cannot be traced back to your wallet."
        >
          Nullifier
        </span>{' '}
        — an <span className="font-semibold text-[#2e335b]">anonymous cryptographic ticket</span> that proves this election has counted your ballot without revealing who you are or what option you chose.
      </p>
    </div>
  );
}
