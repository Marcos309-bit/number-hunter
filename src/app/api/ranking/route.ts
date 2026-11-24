import { NextResponse } from 'next/server';
import { getRankingAndStats } from '@/services/rankingService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const data = await getRankingAndStats();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Ranking fetch error:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar o ranking.' },
      { status: 500 }
    );
  }
}
