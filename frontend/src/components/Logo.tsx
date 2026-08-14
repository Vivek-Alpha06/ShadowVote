// ===========================================================================
// ShadowVote logo
// ---------------------------------------------------------------------------
// An "SV" line-art monogram: a single-weight S curve paired with a V that
// doubles as a ballot check-mark. Drawn as strokes rather than filled shapes so
// it stays crisp at any size and reads as line art.
//
// Inline SVG, not an image file: it inherits the page's gradient tokens, scales
// without a second asset, and adds no network request.
// ===========================================================================

let uid = 0;

/**
 * The mark on its own — square, safe to use as an app icon or avatar.
 *
 * `boxed` draws the rounded-square plate behind it (navbar/favicon use);
 * without it you get the bare monogram, which sits better on large hero art.
 */
export function LogoMark({
  size = 36,
  boxed = true,
  className = '',
}: {
  size?: number;
  boxed?: boolean;
  className?: string;
}) {
  // Gradient ids must be unique per instance — two SVGs sharing an id makes the
  // second one silently adopt the first's gradient.
  const id = `sv-${(uid += 1)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="ShadowVote"
    >
      <defs>
        <linearGradient id={`${id}-stroke`} x1="10" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="0.55" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {boxed && (
        <>
          <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="13" fill={`url(#${id}-plate)`} />
          <rect
            x="0.75"
            y="0.75"
            width="46.5"
            height="46.5"
            rx="13"
            stroke="#8b5cf6"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </>
      )}

      <g
        stroke={`url(#${id}-stroke)`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* S — an open curve, left of centre */}
        <path d="M25.5 15.5c0-3.4-9.5-3.9-9.5 0.6 0 4.4 9.4 3 9.4 7.6 0 4.6-9.4 4.2-9.4 0.6" />
        {/* V — reads as a check mark, the ballot cue */}
        <path d="M23 27.5 L28.5 38 L34 27.5" />
      </g>

      {/* The dot turns the V into a completed tick and balances the mark. */}
      <circle cx="34" cy="14.5" r="2.6" fill="#22d3ee" />
    </svg>
  );
}

/** Mark plus wordmark, for the navbar and any header use. */
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-lg font-extrabold tracking-tight">
        Shadow<span className="gradient-text">Vote</span>
      </span>
    </span>
  );
}
