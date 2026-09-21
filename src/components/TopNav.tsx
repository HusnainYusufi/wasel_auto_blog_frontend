'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Feather, LibraryBig, LogOut, Sparkles, Tags } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LINKS = [
  { href: '/', label: 'Studio', icon: Sparkles },
  { href: '/keywords', label: 'Keywords', icon: Tags },
  { href: '/knowledge', label: 'Knowledge', icon: BrainCircuit },
  { href: '/library', label: 'Library', icon: LibraryBig },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // The login screen renders its own chrome.
  if (!user || pathname === '/login') return null;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2.5 pl-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-glow shadow-lg shadow-brand-500/30">
            <Feather className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
            <span className="animate-pulse-ring absolute inset-0 rounded-xl border border-brand-400" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">
            Wasel<span className="text-brand-500"> Blog Studio</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-white text-brand-600 shadow-sm shadow-brand-500/15 ring-1 ring-brand-100'
                    : 'text-ink-500 hover:bg-white/60 hover:text-ink-800'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {label}
              </Link>
            );
          })}

          <span className="mx-1 h-5 w-px bg-hairline" />

          <div className="flex items-center gap-2 pl-1 pr-1">
            <span className="hidden text-right sm:block">
              <span className="block text-[12.5px] font-medium leading-tight text-ink-800">
                {user.name}
              </span>
              <span className="block text-[10.5px] uppercase tracking-wide text-brand-500">
                {user.role}
              </span>
            </span>
            <button
              onClick={() => void logout()}
              title="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full text-ink-400 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
