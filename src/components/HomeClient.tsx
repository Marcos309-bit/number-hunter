'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import {
  ArrowRight,
  Crosshair,
  Gauge,
  Info,
  LogOut,
  Play,
  ShieldAlert,
  Trophy,
  Zap,
} from 'lucide-react';
import { Navbar } from './Navbar';
import type { PlayerSession } from '@/types/game';

interface HomeClientProps {
  initialPlayer: PlayerSession | null;
}

export function HomeClient({ initialPlayer }: HomeClientProps) {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSession | null>(initialPlayer);
  const [nameInput, setNameInput] = useState(initialPlayer?.nome ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const targetName = player ? player.nome : nameInput;
      if (!player) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: targetName }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          setError(loginData.error ?? 'Informe um nome válido para jogar.');
          return;
        }
        setPlayer(loginData.player);
      }

      const startRes = await fetch('/api/game/start', { method: 'POST' });
      const startData = await startRes.json();
      if (!startRes.ok) {
        setError(startData.error ?? 'Não foi possível iniciar a partida.');
        return;
      }

      router.push('/play');
      router.refresh();
    } catch {
      setError('Falha de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPlayer = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setPlayer(null);
      setNameInput('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar player={player} onLogout={handleSwitchPlayer} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Hero & Player Entry */}
          <section className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-vice-pink/40 bg-vice-pink/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.25em] text-vice-pink shadow-neon-pink">
              <Zap className="h-3.5 w-3.5 text-vice-orange" />
              <span>Vice City Cyber Arena</span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-black uppercase tracking-wider text-white sm:text-5xl lg:text-6xl">
              NUMBER <span className="neon-text-gradient">HUNTER</span>
            </h1>

            <p className="mt-3 font-display text-base font-semibold tracking-wide text-vice-cyan sm:text-xl">
              &ldquo;Can you find the secret number?&rdquo;
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Invada o sistema neon e descubra o código secreto entre{' '}
              <span className="font-mono font-bold text-vice-cyan">1</span> e{' '}
              <span className="font-mono font-bold text-vice-pink">100</span> no menor tempo
              possível. Cada segundo conta para conquistar o topo do pódio.
            </p>

            {/* Login / Start Card */}
            <form
              onSubmit={handleStartGame}
              className="glass-panel-neon mt-7 max-w-xl rounded-2xl p-5 sm:p-6"
            >
              {player ? (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-vice-cyan/35 bg-vice-cyan/10 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-vice-cyan">
                      Jogador Identificado
                    </p>
                    <p className="font-display text-lg font-bold text-white">{player.nome}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchPlayer}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-vice-pink hover:text-vice-pink"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Trocar nome</span>
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label
                    htmlFor="player-name"
                    className="mb-2 block font-display text-xs font-bold uppercase tracking-[0.2em] text-vice-cyan"
                  >
                    Codinome do Jogador
                  </label>
                  <input
                    id="player-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ex.: NeonRider, TommyV..."
                    maxLength={28}
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-vice-purple/45 bg-vice-black/80 px-4 py-3.5 text-base font-semibold text-white placeholder:text-slate-500 focus:border-vice-cyan focus:outline-none focus:ring-2 focus:ring-vice-cyan/35"
                  />
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-vice-pink/60 bg-vice-pink/15 px-3.5 py-2.5 text-sm font-semibold text-pink-200"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon-primary flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{loading ? 'CONECTANDO...' : 'START GAME'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/ranking"
                  className="btn-neon-secondary flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-vice-cyan"
                >
                  <Trophy className="h-4 w-4" />
                  <span>RANKING</span>
                </Link>
              </div>

              {/* Simple Identification Notice */}
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-400">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-vice-orange" />
                <p>
                  <strong className="text-slate-200">Identificação simples:</strong> o acesso usa
                  apenas o seu nome para registrar partidas e ranking (sem senha ou e-mail) — não
                  se trata de uma autenticação segura de identidade.
                </p>
              </div>
            </form>
          </section>

          {/* How It Works HUD Card */}
          <aside className="lg:col-span-5">
            <div className="glass-panel rounded-3xl p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Info className="h-5 w-5 text-vice-cyan" />
                  <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
                    Como Jogar
                  </h2>
                </div>
                <span className="rounded-md border border-vice-purple/50 bg-vice-purple/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-purple-200">
                  RANGE 01–100
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3.5 rounded-2xl border border-white/10 bg-vice-navy/60 p-4 transition hover:border-vice-cyan/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vice-cyan/15 text-vice-cyan">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-vice-cyan">
                      1. Código Secreto no Servidor
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      A cada partida, um número inteiro entre 1 e 100 é sorteado e protegido
                      exclusivamente no servidor.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 rounded-2xl border border-white/10 bg-vice-navy/60 p-4 transition hover:border-vice-pink/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vice-pink/15 text-vice-pink">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-vice-pink">
                      2. Dicas em Tempo Real
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      A cada palpite, o radar informa se o número secreto é{' '}
                      <span className="font-bold text-vice-cyan">MAIOR</span> ou{' '}
                      <span className="font-bold text-vice-pink">MENOR</span> até você acertar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 rounded-2xl border border-white/10 bg-vice-navy/60 p-4 transition hover:border-vice-orange/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vice-orange/15 text-vice-orange">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-vice-orange">
                      3. Corrida Contra o Relógio
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      O tempo oficial é medido pelo servidor. Menor tempo e menos tentativas
                      garantem lugar no pódio global.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
