import { headers } from 'next/headers';
import { Header } from '@/widgets/layouts';
import { DesktopLobby } from '@/widgets/partyroom-page-desktop';
import { MobileLobby } from '@/widgets-mobile/partyroom-page-mobile';

const PartyLobbyPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileLobby />;
  return (
    <>
      <Header />
      <DesktopLobby />
    </>
  );
};

export default PartyLobbyPage;
