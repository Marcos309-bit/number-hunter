'use client';

import Link from 'next/link';
import { Award, Clock, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { NeonParticles } from './NeonParticles';
import { formatDuration } from '@/lib/format';

interface VictoryModalProps {
  open: boolean;
  secretNumber: number;
  elapsedSeconds: number;
  attempts: number;
  playerName: string;
  onPlayAgain: () => void;
  restarting: boolean;
}

export function VictoryModal({
  open,
  secretNumber,
  elapsedSeconds,
  attempts,
  playerName,
  onPlayAgain,
  restarting,
}: VictoryModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-vice-black/85 p-4 backdrop-blur-md"
    >
      <NeonParticles active={open} />

      <div className="glass-panel-neon animate-feedback-pop relative z-50 w-full max-w-lg overflow-hidden rounded-3xl p-6 text-center sm:p-8">
        {/* Top neon accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-vice-pink via-vice-purple to-vice-cyan" />

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-vice-cyan/50 bg-gradient-to-br from-vice-pink/30 via-vice-purple/30 to-vice-cyan/30 shadow-neon-cyan">
          <Sparkles className="h-8 w-8 text-vice-cyan" />
        </div>

        <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-vice-orange">
          Missão Cumprida • {playerName}
        </p>

        <h2
          id="victory-title"
          className="neon-text-gradient mt-2 font-display text-2xl font-black uppercase tracking-wider sm:text-3xl"
        >
          CONGRATULATIONS!
        </h2>
        <p className="mt-1 font-display text-sm font-bold uppercase tracking-[0.28em] text-vice-cyan">
          NUMBER FOUND!
        </p>

        {/* Secret Number Showcase */}
        <div className="mx-auto my-6 flex w-fit flex-col items-center rounded-2xl border border-vice-pink/50 bg-vice-black/75 px-8 py-4 shadow-neon-pink">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
            Número Secreto
          </span>
          <span className="neon-text-sunset font-mono text-5xl font-extrabold tracking-tight sm:text-6xl">
            {secretNumber}
          </span>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl border border-vice-cyan/30 bg-vice-navy/80 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vice-cyan">
              <Clock className="h-4 w-4" />
              <span>Tempo Utilizado</span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>

          <div className="rounded-xl border border-vice-pink/30 bg-vice-navy/80 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vice-pink">
              <Target className="h-4 w-4" />
              <span>Tentativas</span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-white sm:text-2xl">
              {attempts}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
          <Award className="h-4 w-4 text-vice-orange" />
          <span>Resultado registrado automaticamente no ranking global!</span>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            disabled={restarting}
            className="btn-neon-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{restarting ? 'Iniciando...' : 'PLAY AGAIN'}</span>
          </button>

          <Link
            href="/ranking"
            className="btn-neon-secondary flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-vice-cyan"
          >
            <Trophy className="h-4 w-4" />
            <span>VIEW RANKING</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
