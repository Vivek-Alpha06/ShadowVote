// ===========================================================================
// ShadowVote logo
// ---------------------------------------------------------------------------
// An "SV" Overlapping Triangle Line Monogram:
// Flat 3D isometric ribbon lines forming the interlocking letters S and V
// inside a geometric triangle structure with pure radiant white & silver accents.
// ===========================================================================

export function LogoMark({
  size = 40,
  boxed = false,
  light = true,
  className = '',
}: {
  size?: number;
  boxed?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* Ambient Backdrop Glow */}
      <div className="absolute -inset-1 bg-white/40 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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
            {light ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2e335b" />
                <stop offset="50%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
              </>
            )}
          </linearGradient>

          {/* 3D Drop Shadow */}
          <filter id="sv-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor={light ? '#000000' : '#2e335b'} floodOpacity={light ? '0.6' : '0.2'} />
          </filter>
        </defs>

        {boxed && (
          <rect
            x="5"
            y="7"
            width="38"
            height="34"
            rx="8"
            fill={light ? 'rgba(255,255,255,0.15)' : '#ffffff'}
            stroke={light ? 'rgba(255,255,255,0.3)' : '#cdd0e5'}
            strokeWidth="1"
          />
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
export default function Logo({ size = 36, light = true }: { size?: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 group cursor-pointer select-none">
      <LogoMark size={size} light={light} boxed={false} />
      <span
        style={{ color: light ? '#ffffff' : '#2e335b' }}
        className={`text-xl sm:text-2xl font-extrabold tracking-tight font-heading ${
          light
            ? '!text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]'
            : '!text-[#2e335b]'
        }`}
      >
        Shadow<span style={{ color: light ? '#ffffff' : '#6366f1' }} className={light ? '!text-white font-extrabold drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]' : '!text-[#6366f1]'}>Vote</span>
      </span>
    </span>
  );
}
