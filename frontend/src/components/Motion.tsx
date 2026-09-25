// ===========================================================================
// Shared motion + page-chrome primitives
// ---------------------------------------------------------------------------
// The landing page carries the product's visual identity — a dotted grid, an
// ambient glow, and content that reveals in a deliberate order. The inner pages
// had almost none of it, so moving from the hero into the app felt like leaving
// the product for an admin panel.
//
// These are the landing page's own devices, factored out so every screen can use
// them without each one re-deriving its own timings. Keeping the durations and
// easing in ONE place is the point: reveals that differ by 50ms per page read as
// sloppiness even when nobody can say why.
// ===========================================================================

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** One beat. Short enough to never delay reading, long enough to register. */
const DURATION = 0.4;
/** Gap between siblings in a staggered group. */
const STEP = 0.06;

/**
 * Fade-and-rise, optionally staggered by position.
 *
 * `index` shifts the delay so a list reveals in sequence rather than as one
 * block. `inView` defers until the element is scrolled to, which is right for
 * content below the fold and wrong above it — an above-the-fold element waiting
 * for an intersection that already happened looks like a page that failed to
 * load.
 *
 * Respects `prefers-reduced-motion`: the transform is dropped entirely rather
 * than shortened, because for a vestibular trigger a fast movement is still a
 * movement.
 */
export function Reveal({
  children,
  index = 0,
  inView = false,
  className,
  y = 12,
}: {
  children: ReactNode;
  index?: number;
  inView?: boolean;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  const from = { opacity: 0, y: reduced ? 0 : y };
  const to = { opacity: 1, y: 0 };
  const transition = { duration: DURATION, delay: index * STEP, ease: [0.22, 1, 0.36, 1] as const };

  if (inView) {
    return (
      <motion.div
        initial={from}
        whileInView={to}
        viewport={{ once: true, margin: '-60px' }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div initial={from} animate={to} transition={transition} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Page background: the same dotted grid and ambient glow as the hero.
 *
 * `pointer-events-none` on both layers, deliberately — they sit above the page
 * background and would otherwise swallow clicks on anything beneath them.
 */
export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -top-[10%] left-1/2 h-[280px] w-[620px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[110px]" />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Page heading in the landing page's typographic voice: a small uppercase
 * eyebrow, a tight display title, then supporting copy.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <Reveal>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {eyebrow}
            </p>
          </Reveal>
        )}
        <Reveal index={1}>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal index={2}>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
          </Reveal>
        )}
      </div>
      {actions && <Reveal index={3}>{actions}</Reveal>}
    </div>
  );
}

/** Thin separator that fades out at both ends, for sectioning long pages. */
export function Rule({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent ${className}`}
    />
  );
}
