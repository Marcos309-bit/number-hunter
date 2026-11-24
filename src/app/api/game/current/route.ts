import { NextResponse } from 'next/server';
import { getPlayerSession } from '@/lib/session';
import { getCurrentMatch } from '@/services/gameService';
import { getPlayerById } from '@/services/playerService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = getPlayerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada.' },
        { status: 401 }
      );
    }

    const player = await getPlayerById(session.jogadorId);
    if (!player) {
      return NextResponse.json(
        { error: 'Jogador não encontrado.' },
        { status: 401 }
      );
    }

    const match = await getCurrentMatch(player.jogadorId);
    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    console.error('Get current match error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar partida atual.' },
      { status: 500 }
    );
  }
}
