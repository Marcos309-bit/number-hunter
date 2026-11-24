import { NextResponse } from 'next/server';
import { getClearedSessionCookieConfig, getPlayerSession } from '@/lib/session';
import { getPlayerById } from '@/services/playerService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const session = getPlayerSession();
    if (!session) {
      return NextResponse.json({ player: null }, { status: 200 });
    }

    const player = await getPlayerById(session.jogadorId);
    if (!player) {
      const cleared = getClearedSessionCookieConfig();
      const response = NextResponse.json({ player: null }, { status: 200 });
      response.cookies.set(cleared.name, cleared.value, cleared.options);
      return response;
    }

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ player: null }, { status: 200 });
  }
}
