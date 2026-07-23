import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';

type Props = {
  name: string;
  /** 제목 길이와 무관하게 항상 흐른다. */
  scrolling: boolean;
  /** 흐르는 제목이 우측 배지 아래로 지나가므로 페이드로 가린다. */
  faded: boolean;
};

/** 전광판용 TrackTitle 은 Galmuri 폰트를 강제하고 항상 흐르므로 별개다. */
const CursorTitle = ({ name, scrolling, faded }: Props) => (
  <div
    className={cn(
      'min-w-0',
      faded && '[mask-image:linear-gradient(to_right,black_70%,transparent)]'
    )}
  >
    {scrolling ? (
      <Marquee delay={2} speed={20} gradientWidth={0}>
        {/* 반복 사이 간격 — 없으면 제목 끝과 시작이 붙어 읽힌다. */}
        <Typography type='caption1' className='text-gray-50 pr-8'>
          {name}
        </Typography>
      </Marquee>
    ) : (
      <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
        {name}
      </Typography>
    )}
  </div>
);

export default CursorTitle;
