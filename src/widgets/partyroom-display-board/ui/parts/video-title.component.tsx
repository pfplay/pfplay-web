import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';

export default function VideoTitle() {
  const { useCurrentPartyroom } = useStores();
  const playback = useCurrentPartyroom((state) => state.playback);
  const typoClassName = cn(galmuriFont.className, 'text-white leading-none');

  if (!playback) {
    return (
      <Typography type='caption1' className={typoClassName}>
        {'진행 중인 디제잉이 없어요 zZz...' /* TODO: i18n */}
      </Typography>
    );
  }
  return (
    <Marquee delay={4} speed={20} gradientWidth={0} className='z-0'>
      <Typography type='body3' className={typoClassName}>
        {playback.name}
      </Typography>
    </Marquee>
  );
}
