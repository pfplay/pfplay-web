import { headers } from 'next/headers';
import { MobileFallbackCard } from '@/widgets/mobile-fallback-card';
import { DesktopLobby } from '@/widgets/partyroom-page-desktop';

const PartyLobbyPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  return isMobile ? <MobileFallbackCard /> : <DesktopLobby />;
};

export default PartyLobbyPage;
