import { Link, useLocation } from 'react-router-dom';
import WalletButton from './WalletButton';
import Logo from './Logo';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create', label: 'Create' },
  { to: '/results', label: 'Results' },
  { to: '/history', label: 'History' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-[#000000]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="transition-transform hover:scale-105">
            <Logo size={32} />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Preprod
          </div>
        </div>

        <nav className="hidden items-center gap-1 sm:flex bg-zinc-950 border border-zinc-900 p-1 rounded-lg">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                pathname.startsWith(l.to)
                  ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
