import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import { PFCampaign } from '@/shared/ui/icons';

export default function Notice() {
  const { useCurrentPartyroom } = useStores();
  const notice = useCurrentPartyroom((state) => state.notice);
  const typoClassName = cn(galmuriFont.className, 'text-white leading-none');

  return (
    <div className='flex items-center gap-[12px] py-[10px] px-[12px] bg-black border-2 border-gray-800 rounded'>
      <PFCampaign width={20} height={20} className='text-red-300' />

      {!notice && (
        <Typography type='caption2' className={typoClassName}>
          {'공지를 등록해주세요.' /* TODO: i18n */}
        </Typography>
      )}
      {notice && (
        <Marquee delay={4} speed={20} gradientWidth={0} className='flex-1'>
          <Typography type='caption2' className={typoClassName}>
            {notice}
          </Typography>
        </Marquee>
      )}
    </div>
  );
}
