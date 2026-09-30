import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletButton from './WalletButton';
import Logo from './Logo';
import NetworkSwitch from './NetworkSwitch';
import { SHOW_NETWORK_SWITCH } from '../lib/networkPreference';

const links = [
  { to: '/dashboard', label: 'Elections' },
  { to: '/create', label: 'Create Ballot' },
  { to: '/results', label: 'Results' },
  { to: '/history', label: 'Audit Log' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 h-[72px] bg-[#0d1124]/35 backdrop-blur-md border-b border-white/15 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Brand Logo & Testnet Indicator */}
        <div className="flex items-center gap-3.5">
          <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <Logo size={32} light={true} />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Preview Testnet
            </span>
          </div>
          {SHOW_NETWORK_SWITCH && (
            <div className="hidden lg:block">
              <NetworkSwitch compact />
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 shadow-xs">
          <Link
            to="/"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              pathname === '/'
                ? 'bg-white text-[#2e335b] shadow-md font-bold'
                : 'text-white/85 hover:text-white hover:bg-white/15'
            }`}
          >
            Home
          </Link>
          {links.map((l) => {
            const active = pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-white text-[#2e335b] shadow-md font-bold'
                    : 'text-white/85 hover:text-white hover:bg-white/15'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <WalletButton />

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur-md text-white hover:bg-white/25 transition-colors"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-[74px] left-4 right-4 bg-[#141833]/95 backdrop-blur-xl p-5 md:hidden z-50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl border border-white/20">
          <div className="mb-3 flex items-center justify-between border-b border-white/15 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Navigation</span>
            {SHOW_NETWORK_SWITCH && <NetworkSwitch compact />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              Home
            </Link>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
