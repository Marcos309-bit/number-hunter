import { Clock, Gamepad2, Target, Users } from 'lucide-react';
import type { RankingStats } from '@/types/game';
import { formatDuration } from '@/lib/format';

export function StatsCards({ stats }: { stats: RankingStats }) {
  const items = [
    {
      label: 'Melhor Tempo',
      value: stats.melhorTempo !== null ? formatDuration(stats.melhorTempo) : '--:--.-',
      icon: Clock,
      accent: 'border-vice-cyan/35 text-vice-cyan bg-vice-cyan/15',
    },
    {
      label: 'Menor Tentativas',
      value: stats.menorTentativas !== null ? String(stats.menorTentativas) : '--',
      icon: Target,
      accent: 'border-vice-pink/35 text-vice-pink bg-vice-pink/15',
    },
    {
      label: 'Partidas Realizadas',
      value: String(stats.totalPartidas),
      icon: Gamepad2,
      accent: 'border-vice-purple/40 text-purple-300 bg-vice-purple/20',
    },
    {
      label: 'Jogadores Cadastrados',
      value: String(stats.totalJogadores),
      icon: Users,
      accent: 'border-vice-orange/35 text-vice-orange bg-vice-orange/15',
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="glass-panel rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.accent}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 font-mono text-2xl font-extrabold text-white sm:text-3xl">
              {item.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
