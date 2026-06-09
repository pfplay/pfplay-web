'use client';
import Marquee from 'react-fast-marquee';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';
import { galmuriFont } from '@/shared/ui/foundation/fonts';

interface Props {
  /** 곡명. 없으면 emptyText 렌더 */
  name?: string;
  /** 곡 없을 때 표시 문구 */
  emptyText: string;
  className?: string;
}

/**
 * 곡 제목 — Galmuri + 마퀴 프레젠테이션 (데스크탑 VideoTitle에서 추출).
 * 스토어/i18n 와이어링은 호출자(VideoTitle/now-playing) 책임. 본 컴포넌트는 순수 표시.
 */
export default function TrackTitle({ name, emptyText, className }: Props) {
  const typoClassName = cn(galmuriFont.className, 'text-white leading-none', className);

  if (!name) {
    return (
      <Typography type='caption1' className={typoClassName} data-testid='video-title-empty'>
        {emptyText}
      </Typography>
    );
  }
  return (
    <Marquee delay={4} speed={20} gradientWidth={0} className='z-0'>
      <Typography type='body3' className={typoClassName} data-testid='video-title'>
        {name}
      </Typography>
    </Marquee>
  );
}
