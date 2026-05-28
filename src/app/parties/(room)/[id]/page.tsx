import { headers } from 'next/headers';
import { DesktopRoom } from '@/widgets/partyroom-page-desktop';
import { MobileRoom } from '@/widgets-mobile/partyroom-page-mobile';

const PartyroomPage = ({ params }: { params: { id: string } }) => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const partyroomId = Number(params.id);
  return isMobile ? (
    <MobileRoom partyroomId={partyroomId} />
  ) : (
    <DesktopRoom partyroomId={partyroomId} />
  );
};

export default PartyroomPage;
