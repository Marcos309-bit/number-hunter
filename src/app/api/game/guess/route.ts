import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { metric } from '@vercel/functions';
import { getPlayerSession } from '@/lib/session';
import { validateGuessValue } from '@/lib/validation';
import { GameServiceError, submitGuess } from '@/services/gameService';

export async function POST(request: Request) {
  const startedAt = performance.now();
  try {
    const session = getPlayerSession();
    if (!session) {
      metric('game.guess', 1, { outcome: 'unauthorized' });
      return NextResponse.json(
        { error: 'Sessão expirada. Entre novamente com seu nome.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const partidaId = Number(body?.partidaId);
    if (!Number.isInteger(partidaId) || partidaId <= 0) {
      metric('game.guess', 1, { outcome: 'invalid' });
      return NextResponse.json(
        { error: 'Identificador de partida inválido.' },
        { status: 400 }
      );
    }

    const validation = validateGuessValue(body?.palpite);
    if (!validation.valid || validation.valor === undefined) {
      metric('game.guess', 1, { outcome: 'invalid' });
      return NextResponse.json(
        { error: validation.error ?? 'Palpite inválido.' },
        { status: 400 }
      );
    }

    const result = await submitGuess(session.jogadorId, partidaId, validation.valor);

    if (result.resultado === 'ACERTOU') {
      revalidatePath('/ranking');
      metric('game.won', 1, { outcome: 'success' });
    }
    metric('game.guess', 1, { outcome: result.resultado.toLowerCase() });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof GameServiceError) {
      metric('game.guess', 1, { outcome: 'rejected' });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Guess error:', error);
    metric('game.guess', 1, { outcome: 'error' });
    return NextResponse.json(
      { error: 'Erro ao processar o palpite.' },
      { status: 500 }
    );
  } finally {
    metric('game.guess.duration_ms', performance.now() - startedAt);
  }
}
