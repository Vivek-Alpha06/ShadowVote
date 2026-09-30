import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const DURATION = 0.45;
const STEP = 0.08;

export function Reveal({
  children,
  index = 0,
  inView = false,
  className = '',
  y = 14,
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
  const transition = { duration: DURATION, delay: index * STEP, ease: [0.16, 1, 0.3, 1] as const };

  if (inView) {
    return (
      <motion.div
        initial={from}
        whileInView={to}
        viewport={{ once: true, margin: '-40px' }}
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

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative min-h-screen pt-28 pb-20 ${className}`}>
      <div className="relative">{children}</div>
    </div>
  );
}

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
    <div className="flex flex-wrap items-end justify-between gap-6 pb-2">
      <div className="min-w-0 max-w-3xl">
        {eyebrow && (
          <Reveal>
            <div className="mb-3">
              <span className="tag">{eyebrow}</span>
            </div>
          </Reveal>
        )}
        <Reveal index={1}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2e335b] font-heading">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal index={2}>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#2e335b]/75">
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
      {actions && <Reveal index={3} className="shrink-0">{actions}</Reveal>}
    </div>
  );
}

export function Rule({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px w-full bg-gradient-to-r from-transparent via-[#cdd0e5] to-transparent ${className}`}
    />
  );
}
