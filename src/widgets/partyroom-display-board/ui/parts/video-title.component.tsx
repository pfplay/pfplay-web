import Marquee from 'react-fast-marquee';
import { Typography } from '@/shared/ui/components/typography';

export default function VideoTitle() {
  return (
    <Marquee delay={4} speed={20} gradientWidth={0} className='z-0'>
      {/* TODO: 폰트 변경 - https://galmuri.quiple.dev/#%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C */}
      <Typography type='body3' className='text-white'>
        {`NewJeans (뉴진스) 'Hype Boy' Official MV (Performance ver.1)`}
      </Typography>
    </Marquee>
  );
}
