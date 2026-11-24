import crypto from 'node:crypto';
import { ensureDatabaseSchema, getSql } from '@/lib/db';
import { MAX_NUMBER, MIN_NUMBER } from '@/lib/validation';
import type { ActiveMatchState, GuessDirection, GuessEntry, GuessResponse } from '@/types/game';

export class GameServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

interface MatchRow {
  id: number;
  jogador_id: number;
  numero_secreto: number;
  tentativas: number;
  tempo_segundos: number | null;
  palpites: GuessEntry[] | string;
  data_inicio: string | Date;
  data_fim: string | Date | null;
  status: 'em_andamento' | 'vitoria' | 'abandonada';
  server_now?: string | Date;
}

function parsePalpites(raw: GuessEntry[] | string | null | undefined): GuessEntry[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export async function startNewMatch(jogadorId: number): Promise<ActiveMatchState> {
  await ensureDatabaseSchema();
  const sql = getSql();

  // Abandon any unfinished match before starting a fresh one
  await sql`
    UPDATE partidas
    SET
      status = 'abandonada',
      data_fim = NOW(),
      tempo_segundos = ROUND(EXTRACT(EPOCH FROM (NOW() - data_inicio))::numeric, 2)::double precision
    WHERE jogador_id = ${jogadorId}
      AND status = 'em_andamento'
  `;

  const numeroSecreto = crypto.randomInt(MIN_NUMBER, MAX_NUMBER + 1);

  const rows = (await sql`
    INSERT INTO partidas (jogador_id, numero_secreto, tentativas, palpites, status)
    VALUES (${jogadorId}, ${numeroSecreto}, 0, '[]'::jsonb, 'em_andamento')
    RETURNING id, status, tentativas, palpites, data_inicio, NOW() AS server_now
  `) as MatchRow[];

  const match = rows[0];
  if (!match) {
    throw new GameServiceError('Não foi possível iniciar a partida.', 500);
  }

  return {
    partidaId: Number(match.id),
    status: match.status,
    tentativas: Number(match.tentativas),
    dataInicio: toIsoString(match.data_inicio),
    serverNow: toIsoString(match.server_now ?? new Date()),
    palpites: parsePalpites(match.palpites),
  };
}

export async function getCurrentMatch(jogadorId: number): Promise<ActiveMatchState | null> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const rows = (await sql`
    SELECT id, status, tentativas, palpites, data_inicio, NOW() AS server_now
    FROM partidas
    WHERE jogador_id = ${jogadorId}
      AND status = 'em_andamento'
    ORDER BY data_inicio DESC
    LIMIT 1
  `) as MatchRow[];

  const match = rows[0];
  if (!match) return null;

  return {
    partidaId: Number(match.id),
    status: match.status,
    tentativas: Number(match.tentativas),
    dataInicio: toIsoString(match.data_inicio),
    serverNow: toIsoString(match.server_now ?? new Date()),
    palpites: parsePalpites(match.palpites),
  };
}

export async function submitGuess(
  jogadorId: number,
  partidaId: number,
  palpite: number
): Promise<GuessResponse> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const existingRows = (await sql`
    SELECT id, numero_secreto, tentativas, status
    FROM partidas
    WHERE id = ${partidaId}
      AND jogador_id = ${jogadorId}
    LIMIT 1
  `) as MatchRow[];

  const match = existingRows[0];
  if (!match) {
    throw new GameServiceError('Partida não encontrada.', 404);
  }

  if (match.status !== 'em_andamento') {
    throw new GameServiceError('Esta partida já foi encerrada.', 409);
  }

  const secretNumber = Number(match.numero_secreto);
  let resultado: GuessDirection;
  let mensagem: string;

  if (palpite < secretNumber) {
    resultado = 'MAIOR';
    mensagem = 'O NÚMERO SECRETO É MAIOR!';
  } else if (palpite > secretNumber) {
    resultado = 'MENOR';
    mensagem = 'O NÚMERO SECRETO É MENOR!';
  } else {
    resultado = 'ACERTOU';
    mensagem = 'ACERTOU! YOU FOUND THE NUMBER!';
  }

  const entry: GuessEntry = {
    valor: palpite,
    direcao: resultado,
    timestamp: new Date().toISOString(),
  };

  if (resultado === 'ACERTOU') {
    const wonRows = (await sql`
      UPDATE partidas
      SET
        tentativas = tentativas + 1,
        palpites = palpites || ${JSON.stringify([entry])}::jsonb,
        status = 'vitoria',
        data_fim = NOW(),
        tempo_segundos = ROUND(EXTRACT(EPOCH FROM (NOW() - data_inicio))::numeric, 2)::double precision
      WHERE id = ${partidaId}
        AND jogador_id = ${jogadorId}
        AND status = 'em_andamento'
      RETURNING id, status, tentativas, palpites, numero_secreto, tempo_segundos, data_inicio, data_fim
    `) as MatchRow[];

    const updated = wonRows[0];
    if (!updated) {
      throw new GameServiceError('Esta partida já foi finalizada.', 409);
    }

    return {
      partidaId: Number(updated.id),
      status: updated.status,
      resultado,
      mensagem,
      tentativas: Number(updated.tentativas),
      palpites: parsePalpites(updated.palpites),
      numeroSecreto: Number(updated.numero_secreto),
      tempoSegundos: Number(updated.tempo_segundos ?? 0),
      dataInicio: toIsoString(updated.data_inicio),
      dataFim: updated.data_fim ? toIsoString(updated.data_fim) : undefined,
    };
  }

  const updatedRows = (await sql`
    UPDATE partidas
    SET
      tentativas = tentativas + 1,
      palpites = palpites || ${JSON.stringify([entry])}::jsonb
    WHERE id = ${partidaId}
      AND jogador_id = ${jogadorId}
      AND status = 'em_andamento'
    RETURNING id, status, tentativas, palpites
  `) as MatchRow[];

  const updated = updatedRows[0];
  if (!updated) {
    throw new GameServiceError('Esta partida já foi encerrada.', 409);
  }

  return {
    partidaId: Number(updated.id),
    status: updated.status,
    resultado,
    mensagem,
    tentativas: Number(updated.tentativas),
    palpites: parsePalpites(updated.palpites),
  };
}

export async function abandonMatch(jogadorId: number, partidaId: number): Promise<void> {
  await ensureDatabaseSchema();
  const sql = getSql();

  const rows = (await sql`
    UPDATE partidas
    SET
      status = 'abandonada',
      data_fim = NOW(),
      tempo_segundos = ROUND(EXTRACT(EPOCH FROM (NOW() - data_inicio))::numeric, 2)::double precision
    WHERE id = ${partidaId}
      AND jogador_id = ${jogadorId}
      AND status = 'em_andamento'
    RETURNING id
  `) as { id: number }[];

  if (rows.length === 0) {
    throw new GameServiceError('Nenhuma partida ativa encontrada para abandonar.', 404);
  }
}
