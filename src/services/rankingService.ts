import { ensureDatabaseSchema, getSql } from '@/lib/db';
import type { RankingEntry, RankingPayload } from '@/types/game';

interface RankingRow {
  jogador_id: number;
  nome: string;
  tempo_segundos: number;
  tentativas: number;
  data_fim: string | Date;
}

interface StatsRow {
  melhor_tempo: number | null;
  menor_tentativas: number | null;
  total_partidas: number;
  total_jogadores: number;
}

export async function getRankingAndStats(): Promise<RankingPayload> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const [rawRankingRows, rawStatsRows] = await Promise.all([
    sql`
      WITH melhores_por_jogador AS (
        SELECT DISTINCT ON (p.jogador_id)
          p.jogador_id,
          j.nome,
          p.tempo_segundos,
          p.tentativas,
          p.data_fim
        FROM partidas p
        INNER JOIN jogadores j ON j.id = p.jogador_id
        WHERE p.status = 'vitoria'
          AND p.tempo_segundos IS NOT NULL
          AND p.data_fim IS NOT NULL
        ORDER BY
          p.jogador_id,
          p.tempo_segundos ASC,
          p.tentativas ASC,
          p.data_fim ASC
      )
      SELECT
        jogador_id,
        nome,
        tempo_segundos,
        tentativas,
        data_fim
      FROM melhores_por_jogador
      ORDER BY
        tempo_segundos ASC,
        tentativas ASC,
        data_fim ASC
      LIMIT 100
    `,
    sql`
      SELECT
        (SELECT MIN(tempo_segundos) FROM partidas WHERE status = 'vitoria') AS melhor_tempo,
        (SELECT MIN(tentativas) FROM partidas WHERE status = 'vitoria') AS menor_tentativas,
        (SELECT COUNT(*)::integer FROM partidas) AS total_partidas,
        (SELECT COUNT(*)::integer FROM jogadores) AS total_jogadores
    `,
  ]);

  const rankingRows = rawRankingRows as RankingRow[];
  const statsRows = rawStatsRows as StatsRow[];

  const ranking: RankingEntry[] = rankingRows.map((row, index) => ({
    posicao: index + 1,
    jogadorId: Number(row.jogador_id),
    nome: row.nome,
    tempoSegundos: Number(row.tempo_segundos),
    tentativas: Number(row.tentativas),
    dataConquista:
      row.data_fim instanceof Date ? row.data_fim.toISOString() : new Date(row.data_fim).toISOString(),
  }));

  const statsRow = statsRows[0];
  const stats = {
    melhorTempo:
      statsRow?.melhor_tempo !== null && statsRow?.melhor_tempo !== undefined
        ? Number(statsRow.melhor_tempo)
        : null,
    menorTentativas:
      statsRow?.menor_tentativas !== null && statsRow?.menor_tentativas !== undefined
        ? Number(statsRow.menor_tentativas)
        : null,
    totalPartidas: Number(statsRow?.total_partidas ?? 0),
    totalJogadores: Number(statsRow?.total_jogadores ?? 0),
  };

  return { ranking, stats };
}
