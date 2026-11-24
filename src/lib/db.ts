import { neon } from '@neondatabase/serverless';

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }
  return neon(databaseUrl, {
    fetchOptions: {
      cache: 'no-store',
    },
  });
}

let schemaReadyPromise: Promise<void> | null = null;

/**
 * Ensures the required Neon PostgreSQL tables and indexes exist.
 * Safe to invoke on cold starts; memoized per server instance.
 */
export async function ensureDatabaseSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS jogadores (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(60) NOT NULL,
          nome_normalizado VARCHAR(60) NOT NULL UNIQUE,
          data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS partidas (
          id SERIAL PRIMARY KEY,
          jogador_id INTEGER NOT NULL REFERENCES jogadores(id) ON DELETE CASCADE,
          numero_secreto INTEGER NOT NULL CHECK (numero_secreto BETWEEN 1 AND 100),
          tentativas INTEGER NOT NULL DEFAULT 0 CHECK (tentativas >= 0),
          tempo_segundos DOUBLE PRECISION CHECK (tempo_segundos IS NULL OR tempo_segundos >= 0),
          palpites JSONB NOT NULL DEFAULT '[]'::jsonb,
          data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          data_fim TIMESTAMPTZ,
          status VARCHAR(20) NOT NULL DEFAULT 'em_andamento'
            CHECK (status IN ('em_andamento', 'vitoria', 'abandonada'))
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_partidas_ranking
          ON partidas (status, tempo_segundos ASC, tentativas ASC, data_fim ASC)
          WHERE status = 'vitoria'
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_partidas_jogador_status
          ON partidas (jogador_id, status)
      `;
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  return schemaReadyPromise;
}
