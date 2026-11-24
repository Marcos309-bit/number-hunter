import { redirect } from 'next/navigation';
import { NeonBackdrop } from '@/components/NeonBackdrop';
import { GameArena } from '@/components/GameArena';
import { getPlayerSession } from '@/lib/session';
import { getCurrentMatch } from '@/services/gameService';
import { getPlayerById } from '@/services/playerService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function PlayPage() {
  const session = getPlayerSession();
  if (!session) {
    redirect('/');
  }

  const player = await getPlayerById(session.jogadorId).catch(() => null);
  if (!player) {
    redirect('/');
  }

  const currentMatch = await getCurrentMatch(player.jogadorId);

  return (
    <>
      <NeonBackdrop />
      <GameArena player={player} initialMatch={currentMatch} />
    </>
  );
}
