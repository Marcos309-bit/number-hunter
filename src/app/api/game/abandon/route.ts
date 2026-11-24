import { NextResponse } from 'next/server';
import { metric } from '@vercel/functions';
import { getPlayerSession } from '@/lib/session';
import { abandonMatch, GameServiceError } from '@/services/gameService';

export async function POST(request: Request) {
  try {
    const session = getPlayerSession();
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const partidaId = Number(body?.partidaId);
    if (!Number.isInteger(partidaId) || partidaId <= 0) {
      return NextResponse.json({ error: 'Identificador de partida inválido.' }, { status: 400 });
    }

    await abandonMatch(session.jogadorId, partidaId);
    metric('game.abandoned', 1, { outcome: 'success' });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof GameServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Abandon error:', error);
    return NextResponse.json({ error: 'Erro ao abandonar a partida.' }, { status: 500 });
  }
}
