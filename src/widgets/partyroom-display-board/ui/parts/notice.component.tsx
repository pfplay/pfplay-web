import Marquee from 'react-fast-marquee';
import { Typography } from '@/shared/ui/components/typography';
import { PFCampaign } from '@/shared/ui/icons';

export default function Notice() {
  return (
    <div className='flex gap-[12px] py-[10px] px-[12px] bg-black border-2 border-gray-800 rounded'>
      <PFCampaign width={20} height={20} className='text-red-300' />

      <Marquee delay={4} speed={20} gradientWidth={0} className='flex-1'>
        {/* TODO: 실제 공지사항 반영 */}
        {/* TODO: 폰트 변경 - https://galmuri.quiple.dev/#%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C */}
        <Typography type='caption2' className='text-white'>
          No slander or socialising between members. Violators will be banned immediately
        </Typography>
      </Marquee>
    </div>
  );
}
