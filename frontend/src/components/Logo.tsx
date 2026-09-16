// ===========================================================================
// ShadowVote logo
// ---------------------------------------------------------------------------
// An "SV" Overlapping Triangle Line Monogram:
// Flat 3D isometric ribbon lines forming the interlocking letters S and V
// inside a geometric triangle structure.
// ===========================================================================

export function LogoMark({
  size = 40,
  boxed = false,
  className = '',
}: {
  size?: number;
  boxed?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* Ambient Backdrop Glow */}
      <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <svg
        width={size}
        height={size}
        viewBox="4 6 40 36"
        fill="none"
        className="relative transform transition-transform duration-300 group-hover:scale-105"
        role="img"
        aria-label="ShadowVote"
      >
        <defs>
          <linearGradient id="sv-grad-primary" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#e4d4f4" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* 3D Drop Shadow */}
          <filter id="sv-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.7" />
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#a855f7" floodOpacity="0.4" />
          </filter>
        </defs>

        {boxed && (
          <rect x="5" y="7" width="38" height="34" rx="8" fill="#0c0d12" stroke="#27272a" strokeWidth="1" />
        )}

        {/* SV Inverted Overlapping Triangle Vector Geometry */}
        <g filter="url(#sv-depth-shadow)">
          {/* Component 1: Top Frame & Upper S Return */}
          <path
            d="M 6 8 L 42 8 L 38.11 14.98 L 35.19 14.98 L 37.52 10.59 L 10.48 10.59 L 15.24 19.36 L 16.8 19.56 L 18.26 22.16 L 13.88 22.06 Z"
            fill="url(#sv-grad-primary)"
          />

          {/* Component 2: Interlocking V and Lower S Loop */}
          <path
            d="M 13.49 12.39 L 16.41 12.49 L 20.4 19.56 L 27.6 19.56 L 31.59 12.49 L 34.51 12.39 L 30.52 19.46 L 35.48 19.56 L 24 40 L 16.51 26.74 L 19.43 26.74 L 24 34.82 L 31.1 22.26 L 21.96 22.26 L 24 25.94 L 25.75 22.85 L 28.67 22.85 L 24 31.03 Z"
            fill="url(#sv-grad-primary)"
          />
        </g>
      </svg>
    </div>
  );
}

/** Mark plus wordmark, for the navbar and any header use. */
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3 group cursor-pointer">
      <LogoMark size={size} boxed={false} />
      <span className="text-lg font-bold tracking-tight text-white flex items-center gap-0.5 font-sans transition-colors group-hover:text-zinc-200">
        Shadow<span className="text-purple-400 group-hover:text-purple-300">Vote</span>
      </span>
    </span>
  );
}

