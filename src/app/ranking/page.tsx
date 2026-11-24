import Link from 'next/link';
import { Play, Trophy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { NeonBackdrop } from '@/components/NeonBackdrop';
import { RankingPodium } from '@/components/RankingPodium';
import { RankingTable } from '@/components/RankingTable';
import { StatsCards } from '@/components/StatsCards';
import { getPlayerSession } from '@/lib/session';
import { getPlayerById } from '@/services/playerService';
import { getRankingAndStats } from '@/services/rankingService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function RankingPage() {
  const session = getPlayerSession();
  const [player, rankingPayload] = await Promise.all([
    session ? getPlayerById(session.jogadorId).catch(() => null) : Promise.resolve(null),
    getRankingAndStats(),
  ]);

  const topThree = rankingPayload.ranking.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <NeonBackdrop />
      <Navbar player={player} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-vice-cyan/40 bg-vice-cyan/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-vice-cyan">
              <Trophy className="h-3.5 w-3.5" />
              <span>Hall da Fama Neon</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-black uppercase tracking-wider text-white sm:text-4xl">
              RANKING <span className="neon-text-gradient">GLOBAL</span>
            </h1>
            <p className="mt-1 text-sm text-slate-300 sm:text-base">
              Classificação ordenada pelo menor tempo de resposta, com menos tentativas como
              desempate.
            </p>
          </div>

          <Link
            href={player ? '/play' : '/'}
            className="btn-neon-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{player ? 'Voltar para Arena' : 'Entrar e Jogar'}</span>
          </Link>
        </div>

        <StatsCards stats={rankingPayload.stats} />
        <RankingPodium topThree={topThree} />
        <RankingTable
          entries={rankingPayload.ranking}
          currentPlayerId={player?.jogadorId ?? null}
        />
      </main>
    </div>
  );
}
