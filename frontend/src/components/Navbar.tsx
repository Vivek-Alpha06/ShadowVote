import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletButton from './WalletButton';
import Logo from './Logo';
import NetworkSwitch from './NetworkSwitch';
import { SHOW_NETWORK_SWITCH } from '../lib/networkPreference';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🗳️' },
  { to: '/create', label: 'Create Election', icon: '➕' },
  { to: '/results', label: 'Live Results', icon: '📊' },
  { to: '/history', label: 'History', icon: '📜' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#060608]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
            <Logo size={36} />
          </Link>

          {SHOW_NETWORK_SWITCH && (
            <div className="hidden sm:block">
              <NetworkSwitch compact />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 sm:flex bg-[#0b0c10] border border-white/[0.08] p-1 rounded-xl shadow-inner">
          {links.map((l) => {
            const active = pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] border border-violet-400/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <WalletButton />

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 sm:hidden hover:text-white hover:border-zinc-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/[0.08] bg-[#090a0f] px-4 py-4 sm:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Navigation</span>
            {SHOW_NETWORK_SWITCH && <NetworkSwitch compact />}
          </div>
          <div className="flex flex-col gap-1.5">
            {links.map((l) => {
              const active = pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
                      : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span aria-hidden>{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
