'use client';
import Image from 'next/image';
import React from 'react';
import DisplayOptionMenuOnHoverListener from '@/components/@shared/DisplayOptionMenuOnHoverListener';
import Icons from '@/components/__legacy__/Icons';
import Typography from './Typography';
import { MenuItem } from '../Menu';
import { cn } from '@/lib/utils';

interface PlayListItemProps {
  id: number;
  title: string;
  duration: string;
  src?: string;
  alt: string;
}

const exampleMenuConfig: Array<MenuItem> = [
  { onClickItem: () => console.log('삭제 clicked'), label: '삭제' },
  { onClickItem: () => console.log('꿀 clicked'), label: '꿀' },
  { onClickItem: () => console.log('킥 clicked'), label: '킥' },
  { onClickItem: () => console.log('밴 clicked'), label: '밴' },
];

const PlayListItem = ({ id, title, duration, src, alt }: PlayListItemProps) => {
  const handlePlayBtnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
    e.stopPropagation();
    console.log(`id: ${id}는 향후 비디오 재생 api 연결에 사용될 예정입니다.`);
  };

  return (
    <DisplayOptionMenuOnHoverListener menuConfig={exampleMenuConfig}>
      {(isHover) => (
        <div className='relative w-full flexRow justify-start rounded gap-[12px]'>
          <div className='relative w-[80px] h-[44px] bg-gray-700'>
            <Image
              priority
              src={src ?? '/image/thumbnail.png'}
              alt={alt ?? title}
              width={80}
              height={44}
              className={cn('w-full h-full object-contain select-none', isHover && 'opacity-60')}
            />
            <div
              className={cn([
                'absolute inset-0 bg-transparent cursor-pointer z-50 flex justify-center items-center',
                'opacity-from-zero',
                isHover && 'opacity-100',
              ])}
              onClick={(e) => handlePlayBtnClick(e, id)}
            >
              <Icons.play />
            </div>
          </div>
          <div className='flexCol flex-1 min-w-0 select-none'>
            <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
              {title}
            </Typography>
            <Typography type='caption1' className='self-end text-gray-400'>
              {duration}
            </Typography>
          </div>
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default PlayListItem;
