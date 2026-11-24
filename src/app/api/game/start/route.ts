import { NextResponse } from 'next/server';
import { metric } from '@vercel/functions';
import { getPlayerSession } from '@/lib/session';
import { startNewMatch } from '@/services/gameService';
import { getPlayerById } from '@/services/playerService';

export async function POST() {
  const startedAt = performance.now();
  try {
    const session = getPlayerSession();
    if (!session) {
      metric('game.started', 1, { outcome: 'unauthorized' });
      return NextResponse.json(
        { error: 'Sessão não encontrada. Informe seu nome para jogar.' },
        { status: 401 }
      );
    }

    const player = await getPlayerById(session.jogadorId);
    if (!player) {
      metric('game.started', 1, { outcome: 'unauthorized' });
      return NextResponse.json(
        { error: 'Jogador não encontrado. Entre novamente com seu nome.' },
        { status: 401 }
      );
    }

    const match = await startNewMatch(player.jogadorId);
    metric('game.started', 1, { outcome: 'success' });
    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error('Start match error:', error);
    metric('game.started', 1, { outcome: 'error' });
    return NextResponse.json(
      { error: 'Erro ao iniciar nova partida.' },
      { status: 500 }
    );
  } finally {
    metric('game.start.duration_ms', performance.now() - startedAt);
  }
}
