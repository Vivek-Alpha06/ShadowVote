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
  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {/* 3D Ambient Backdrop Glow */}
      <div className="absolute inset-0 rounded-xl bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className="relative transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1"
        role="img"
        aria-label="ShadowVote"
      >
        <defs>
          {/* 3D Metallic Surface Gradients */}
          <linearGradient id="shield-metal-3d" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2c2d35" />
            <stop offset="45%" stopColor="#14151b" />
            <stop offset="70%" stopColor="#0a0a0d" />
            <stop offset="100%" stopColor="#1c1d24" />
          </linearGradient>

          <linearGradient id="shield-bevel-3d" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#71717a" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#27272a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="tick-3d" x1="19" y1="20" x2="29" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </linearGradient>

          {/* 3D Drop Shadows */}
          <filter id="logo-depth-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.2" />
          </filter>
        </defs>

        {boxed && (
          <>
            {/* Boxed plate with 3D depth border */}
            <rect x="1" y="1" width="46" height="46" rx="12" fill="#0c0d12" stroke="#27272a" strokeWidth="1.5" />
            <rect x="2" y="2" width="44" height="44" rx="11" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </>
        )}

        {/* 3D Geometric Shield with Metallic Bevel */}
        <g filter="url(#logo-depth-shadow)">
          <path
            d="M24 10L36 15.5V25C36 32.5 24 38 24 38C24 38 12 32.5 12 25V15.5L24 10Z"
            fill="url(#shield-metal-3d)"
            stroke="url(#shield-bevel-3d)"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* 3D Inner Facet Light Crease */}
          <path
            d="M24 10V38"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />

          {/* 3D Crisp Embossed Ballot Checkmark */}
          <path
            d="M19 24.5L22.5 28L29 20"
            stroke="url(#tick-3d)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

/** Mark plus wordmark, for the navbar and any header use. */
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5 group cursor-pointer">
      <LogoMark size={size} />
      <span className="text-base font-bold tracking-tight text-white flex items-center gap-0.5 font-sans transition-colors group-hover:text-zinc-200">
        Shadow<span className="text-zinc-400 group-hover:text-zinc-300">Vote</span>
      </span>
    </span>
  );
}
