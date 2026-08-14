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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-midnight-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="transition-opacity hover:opacity-90">
          <Logo size={36} />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(l.to)
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-100'
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
