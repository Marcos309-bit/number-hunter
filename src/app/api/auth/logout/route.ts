import { NextResponse } from 'next/server';
import { getClearedSessionCookieConfig } from '@/lib/session';

export async function POST() {
  const cleared = getClearedSessionCookieConfig();
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(cleared.name, cleared.value, cleared.options);
  return response;
}
