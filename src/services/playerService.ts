import { ensureDatabaseSchema, getSql } from '@/lib/db';
import { normalizePlayerName, sanitizePlayerName } from '@/lib/normalize';
import type { PlayerSession } from '@/types/game';

interface PlayerRow {
  id: number;
  nome: string;
  nome_normalizado: string;
}

export async function findOrCreatePlayer(rawName: string): Promise<PlayerSession> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const nome = sanitizePlayerName(rawName);
  const nomeNormalizado = normalizePlayerName(rawName);

  const rows = (await sql`
    INSERT INTO jogadores (nome, nome_normalizado)
    VALUES (${nome}, ${nomeNormalizado})
    ON CONFLICT (nome_normalizado)
    DO UPDATE SET nome = jogadores.nome
    RETURNING id, nome, nome_normalizado
  `) as PlayerRow[];

  const player = rows[0];
  if (!player) {
    throw new Error('Failed to resolve player record.');
  }

  return {
    jogadorId: Number(player.id),
    nome: player.nome,
    nomeNormalizado: player.nome_normalizado,
  };
}

export async function getPlayerById(jogadorId: number): Promise<PlayerSession | null> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT id, nome, nome_normalizado
    FROM jogadores
    WHERE id = ${jogadorId}
    LIMIT 1
  `) as PlayerRow[];

  const player = rows[0];
  if (!player) return null;

  return {
    jogadorId: Number(player.id),
    nome: player.nome,
    nomeNormalizado: player.nome_normalizado,
  };
}
