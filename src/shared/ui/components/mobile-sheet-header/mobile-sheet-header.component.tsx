'use client';
import { FC, ReactNode, useId } from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  /** 좌측 액션 (뒤로/닫기 등). 없으면 대칭 스페이서로 폭 보존 */
  leading?: ReactNode;
  title?: string;
  /** 우측 액션 (메뉴 등). 없으면 대칭 스페이서 */
  trailing?: ReactNode;
  /** title element id 연결용 (dialog aria-labelledby) */
  titleId?: string;
  className?: string;
}

/**
 * 모바일 시트/룸 상단 표준 헤더 (spec A3).
 * 좌(leading) · 중앙 title(Typography) · 우(trailing) 3분할, 56px 높이, 하단 border-gray-800.
 * leading/trailing 미지정 측은 동일 폭 스페이서로 중앙 정렬 보존.
 */
const MobileSheetHeader: FC<Props> = ({ leading, title, trailing, titleId, className }) => {
  const autoId = useId();
  const id = titleId ?? autoId;
  return (
    <header
      className={cn(
        'shrink-0 flex items-center gap-3 px-3 h-14 border-b border-gray-800',
        className
      )}
    >
      <div className='w-10 flex items-center justify-start'>{leading}</div>
      {title && (
        <Typography id={id} type='body3' overflow='ellipsis' className='flex-1 text-center'>
          {title}
        </Typography>
      )}
      <div className='w-10 flex items-center justify-end'>{trailing}</div>
    </header>
  );
};

export default MobileSheetHeader;
