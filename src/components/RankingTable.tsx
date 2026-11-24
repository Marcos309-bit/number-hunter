import type { RankingEntry } from '@/types/game';
import { formatDuration } from '@/lib/format';

function formatDatePtBr(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function RankingTable({
  entries,
  currentPlayerId,
}: {
  entries: RankingEntry[];
  currentPlayerId?: number | null;
}) {
  if (entries.length === 0) {
    return (
      <div className="glass-panel mt-8 rounded-3xl p-10 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-white">
          Nenhuma vitória registrada ainda
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Seja o primeiro jogador a descobrir o número secreto e inaugurar o ranking!
        </p>
      </div>
    );
  }

  return (
    <section className="glass-panel mt-8 overflow-hidden rounded-3xl">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
          Classificação Geral (Melhor Marca por Jogador)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-3.5">Posição</th>
              <th className="px-6 py-3.5">Jogador</th>
              <th className="px-6 py-3.5">Tempo</th>
              <th className="px-6 py-3.5">Tentativas</th>
              <th className="px-6 py-3.5">Data da Conquista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {entries.map((entry) => {
              const isCurrent = currentPlayerId === entry.jogadorId;
              const badgeColor =
                entry.posicao === 1
                  ? 'border-amber-300/60 bg-amber-400/20 text-amber-300'
                  : entry.posicao === 2
                    ? 'border-slate-300/50 bg-slate-300/15 text-slate-200'
                    : entry.posicao === 3
                      ? 'border-orange-400/55 bg-orange-400/20 text-orange-300'
                      : 'border-white/15 bg-white/5 text-slate-300';

              return (
                <tr
                  key={entry.jogadorId}
                  className={`transition hover:bg-white/[0.04] ${
                    isCurrent ? 'bg-vice-cyan/10' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex h-7 min-w-[2.2rem] items-center justify-center rounded-lg border px-2 font-mono text-xs font-extrabold ${badgeColor}`}
                    >
                      #{entry.posicao}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-display font-bold text-white">
                    <span>{entry.nome}</span>
                    {isCurrent && (
                      <span className="ml-2 rounded-md border border-vice-cyan/50 bg-vice-cyan/20 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-vice-cyan">
                        Você
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-vice-cyan">
                    {formatDuration(entry.tempoSegundos)}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-vice-pink">
                    {entry.tentativas}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {formatDatePtBr(entry.dataConquista)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
