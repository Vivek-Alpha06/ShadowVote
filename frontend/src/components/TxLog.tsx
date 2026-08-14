import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { txLog } from '../lib/contractService';
import { formatDate } from '../lib/format';
import { explorerTxUrl } from '../lib/explorer';
import { useWallet } from '../hooks/useWallet';

/**
 * Transaction hashes produced by this session. These are real on-chain
 * identifiers recovered from the wallet after each submission.
 */
export default function TxLog() {
  const [, force] = useState(0);
  const { networkId } = useWallet();

  // txLog is a plain module array; poll so new entries appear.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 2000);
    return () => clearInterval(id);
  }, []);

  if (txLog.length === 0) return null;

  return (
    <div className="glass mt-8 p-5">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-100">
        ⛓ On-chain transactions
        <span className="text-sm font-normal text-slate-500">({txLog.length})</span>
        <Link to="/history" className="ml-auto text-xs font-semibold text-shadow-purple hover:underline">
          Full history →
        </Link>
      </h3>
      <ul className="space-y-2">
        {txLog.map((tx) => (
          <li
            key={tx.hash + tx.at}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-2 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">{tx.action}</p>
              <p className="break-all font-mono text-xs text-shadow-cyan">{tx.hash}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{formatDate(tx.at)}</span>
              {explorerTxUrl(tx.hash, networkId) && (
                <a
                  href={explorerTxUrl(tx.hash, networkId)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-shadow-cyan hover:underline"
                >
                  verify ↗
                </a>
              )}
              <button
                onClick={() => navigator.clipboard?.writeText(tx.hash)}
                className="text-xs font-semibold text-shadow-purple hover:underline"
              >
                copy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
