import { Crown, Medal, Trophy } from 'lucide-react';
import type { RankingEntry } from '@/types/game';
import { formatDuration } from '@/lib/format';

interface PodiumStyle {
  badge: string;
  border: string;
  glow: string;
  height: string;
  titleColor: string;
  label: string;
}

const PODIUM_STYLES: Record<number, PodiumStyle> = {
  1: {
    badge: 'bg-amber-400/20 text-amber-300 border-amber-300/60',
    border: 'border-amber-300/60',
    glow: 'shadow-[0_0_32px_rgba(251,191,36,0.28)]',
    height: 'md:min-h-[240px]',
    titleColor: 'text-amber-300',
    label: '1º LUGAR • OURO',
  },
  2: {
    badge: 'bg-slate-200/15 text-slate-200 border-slate-300/50',
    border: 'border-slate-300/50',
    glow: 'shadow-[0_0_24px_rgba(226,232,240,0.18)]',
    height: 'md:min-h-[210px]',
    titleColor: 'text-slate-200',
    label: '2º LUGAR • PRATA',
  },
  3: {
    badge: 'bg-orange-400/20 text-orange-300 border-orange-400/55',
    border: 'border-orange-400/55',
    glow: 'shadow-[0_0_24px_rgba(255,140,66,0.22)]',
    height: 'md:min-h-[190px]',
    titleColor: 'text-orange-300',
    label: '3º LUGAR • BRONZE',
  },
};

export function RankingPodium({ topThree }: { topThree: RankingEntry[] }) {
  if (topThree.length === 0) return null;

  // Visual podium order on desktop: 2nd | 1st | 3rd
  const ordered =
    topThree.length === 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-300" />
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.22em] text-white">
          Pódio Vice City
        </h2>
      </div>

      <div className="grid items-end gap-4 md:grid-cols-3">
        {ordered.map((entry) => {
          const style = PODIUM_STYLES[entry.posicao] ?? PODIUM_STYLES[3];
          return (
            <div
              key={entry.jogadorId}
              className={`glass-panel flex flex-col justify-between rounded-3xl border p-5 transition hover:-translate-y-1 ${style.border} ${style.glow} ${style.height}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-wider ${style.badge}`}
                  >
                    {entry.posicao === 1 ? (
                      <Crown className="h-3.5 w-3.5" />
                    ) : (
                      <Medal className="h-3.5 w-3.5" />
                    )}
                    <span>{style.label}</span>
                  </span>
                </div>

                <h3
                  className={`mt-4 truncate font-display text-xl font-black tracking-wide ${style.titleColor}`}
                >
                  {entry.nome}
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Tempo
                  </span>
                  <p className="font-mono text-lg font-extrabold text-vice-cyan">
                    {formatDuration(entry.tempoSegundos)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Tentativas
                  </span>
                  <p className="font-mono text-lg font-extrabold text-vice-pink">
                    {entry.tentativas}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
