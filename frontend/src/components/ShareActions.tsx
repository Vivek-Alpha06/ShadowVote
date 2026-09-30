import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

/**
 * Copy-link button.
 *
 *   "Would be great to include a Copy Election Link button directly on the
 *    election details card for easy sharing in Telegram or Discord groups."
 *     -- Vikramaditya Bose, 4 stars
 *
 * Organizers were selecting the URL out of the address bar by hand, which on
 * mobile is genuinely awkward. The clipboard API needs a user gesture and a
 * secure context, so a failure is expected rather than exceptional — the
 * fallback selects the text so it can still be copied manually.
 */
export default function CopyLinkButton({
  url = typeof window !== 'undefined' ? window.location.href : '',
  label = 'Copy link',
  className = 'button ghost sm text-xs',
}: {
  url?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Insecure context, denied permission, or an older browser. Show the
      // URL so the user can still get it — never fail silently.
      setFailed(true);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={copy} className={`${className} flex items-center gap-1.5`} title={url}>
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
          </>
        )}
      </button>
      {failed && (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="input py-1 text-xs"
          aria-label="Election link — select and copy"
        />
      )}
    </div>
  );
}
