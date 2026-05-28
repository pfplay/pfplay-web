import { headers } from 'next/headers';
import { Header } from '@/widgets/layouts';
import { MobileFallbackCard } from '@/widgets/mobile-fallback-card';
import { DesktopLobby } from '@/widgets/partyroom-page-desktop';

const PartyLobbyPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileFallbackCard />;
  return (
    <>
      <Header />
      <DesktopLobby />
    </>
  );
};

export default PartyLobbyPage;
