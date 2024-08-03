import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';
import { PFCampaign } from '@/shared/ui/icons';

export default function Notice() {
  return (
    <div className='flex gap-[12px] py-[10px] px-[12px] bg-black border-2 border-gray-800 rounded'>
      <PFCampaign width={20} height={20} className='text-red-300' />

      <Marquee delay={4} speed={20} gradientWidth={0} className='flex-1'>
        <Typography type='caption2' className={cn(galmuriFont.className, 'text-white')}>
          {/* TODO: 실제 공지사항 반영 */}
          No slander or socialising between members. Violators will be banned immediately
        </Typography>
      </Marquee>
    </div>
  );
}
