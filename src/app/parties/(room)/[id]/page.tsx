import { headers } from 'next/headers';
import { MobileFallbackCard } from '@/widgets/mobile-fallback-card';
import { DesktopRoom } from '@/widgets/partyroom-page-desktop';

const PartyroomPage = ({ params }: { params: { id: string } }) => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const partyroomId = Number(params.id);
  return isMobile ? <MobileFallbackCard /> : <DesktopRoom partyroomId={partyroomId} />;
};

export default PartyroomPage;
