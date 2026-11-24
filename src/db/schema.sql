CREATE TABLE IF NOT EXISTS jogadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  nome_normalizado VARCHAR(60) NOT NULL UNIQUE,
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS idx_partidas_ranking
  ON partidas (status, tempo_segundos ASC, tentativas ASC, data_fim ASC)
  WHERE status = 'vitoria';

CREATE INDEX IF NOT EXISTS idx_partidas_jogador_status
  ON partidas (jogador_id, status);
