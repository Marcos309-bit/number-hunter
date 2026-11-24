'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Crosshair, LogOut, Trophy, User } from 'lucide-react';
import { useState } from 'react';
import type { PlayerSession } from '@/types/game';

interface NavbarProps {
  player: PlayerSession | null;
  onLogout?: () => void;
}

export function Navbar({ player, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      } else {
        router.push('/');
        router.refresh();
      }
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-vice-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-vice-pink/50 bg-gradient-to-br from-vice-pink/25 via-vice-purple/25 to-vice-cyan/25 shadow-neon-pink transition-transform group-hover:scale-105">
            <Crosshair className="h-5 w-5 text-vice-cyan" />
          </div>
          <div className="leading-tight">
            <span className="font-display text-sm font-extrabold tracking-[0.18em] text-white sm:text-base">
              NUMBER <span className="text-vice-pink">HUNTER</span>
            </span>
            <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-vice-cyan/80 sm:block">
              Vice City Grid
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {player && pathname !== '/play' && (
            <Link
              href="/play"
              className="rounded-lg border border-vice-pink/40 bg-vice-pink/15 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-vice-pink transition hover:border-vice-pink hover:bg-vice-pink/25 hover:shadow-neon-pink"
            >
              Jogar
            </Link>
          )}

          <Link
            href="/ranking"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider transition ${
              pathname === '/ranking'
                ? 'border-vice-cyan bg-vice-cyan/20 text-vice-cyan shadow-neon-cyan'
                : 'border-white/15 bg-white/5 text-slate-200 hover:border-vice-cyan/60 hover:text-vice-cyan'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Ranking</span>
          </Link>

          {player && (
            <div className="flex items-center gap-2 rounded-lg border border-vice-purple/40 bg-vice-indigo/60 px-2.5 py-1.5">
              <User className="h-3.5 w-3.5 text-vice-cyan" />
              <span className="max-w-[110px] truncate text-xs font-bold tracking-wide text-white sm:max-w-[160px]">
                {player.nome}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sair / Trocar jogador"
                className="ml-1 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300 transition hover:border-vice-pink/60 hover:bg-vice-pink/20 hover:text-white disabled:opacity-50"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
