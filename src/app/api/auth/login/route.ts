import { NextResponse } from 'next/server';
import { metric } from '@vercel/functions';
import { getSessionCookieConfig } from '@/lib/session';
import { validatePlayerName } from '@/lib/validation';
import { findOrCreatePlayer } from '@/services/playerService';

export async function POST(request: Request) {
  const startedAt = performance.now();
  try {
    const body = await request.json().catch(() => null);
    const validation = validatePlayerName(body?.nome);

    if (!validation.valid || !validation.nome) {
      metric('player.login', 1, { outcome: 'invalid' });
      return NextResponse.json(
        { error: validation.error ?? 'Nome inválido.' },
        { status: 400 }
      );
    }

    const player = await findOrCreatePlayer(validation.nome);
    const cookieConfig = getSessionCookieConfig(player);

    const response = NextResponse.json({ player }, { status: 200 });
    response.cookies.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);

    metric('player.login', 1, { outcome: 'success' });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    metric('player.login', 1, { outcome: 'error' });
    return NextResponse.json(
      { error: 'Não foi possível identificar o jogador no momento.' },
      { status: 500 }
    );
  } finally {
    metric('player.login.duration_ms', performance.now() - startedAt);
  }
}
