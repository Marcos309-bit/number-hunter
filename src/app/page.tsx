import { NeonBackdrop } from '@/components/NeonBackdrop';
import { HomeClient } from '@/components/HomeClient';
import { getPlayerSession } from '@/lib/session';
import { getPlayerById } from '@/services/playerService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const session = getPlayerSession();
  const player = session ? await getPlayerById(session.jogadorId).catch(() => null) : null;

  return (
    <>
      <NeonBackdrop />
      <HomeClient initialPlayer={player} />
    </>
  );
}
