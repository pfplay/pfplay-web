import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';

export default function VideoTitle() {
  const { useCurrentPartyroom } = useStores();
  const videoTitle = useCurrentPartyroom((state) => state.playback?.name);

  return (
    <Marquee delay={4} speed={20} gradientWidth={0} className='z-0'>
      <Typography type='body3' className={cn(galmuriFont.className, 'text-white')}>
        {videoTitle}
      </Typography>
    </Marquee>
  );
}
