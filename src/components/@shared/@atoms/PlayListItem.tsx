'use client';
import Image from 'next/image';
import React from 'react';
import { PFPlayCircleFilled } from '@/components/@shared/@icons';
import DisplayOptionMenuOnHoverListener from '@/components/@shared/DisplayOptionMenuOnHoverListener';

import { cn } from '@/utils/cn';
import { MenuItem } from './Menu/MenuItemPanel';
import Typography from './Typography';

export interface PlayListItemType {
  id: number;
  title: string;
  duration: string;
  src?: string;
  alt: string;
}

interface UserListItemProps {
  playListItemConfig: PlayListItemType;
  menuItemList: Array<MenuItem>;
}

const PlayListItem = ({ playListItemConfig, menuItemList }: UserListItemProps) => {
  const handlePlayBtnClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
    e.stopPropagation();
    console.log(`id: ${id}는 향후 비디오 재생 api 연결에 사용될 예정입니다.`);
  };

  return (
    <DisplayOptionMenuOnHoverListener menuConfig={menuItemList}>
      {(isHover) => (
        <div className='relative w-full flexRow justify-start rounded gap-[12px]'>
          <div className='relative w-[80px] h-[44px] bg-gray-700'>
            <Image
              priority
              src={playListItemConfig.src ?? '/images/ETC/PlaylistThumbnail.png'}
              alt={playListItemConfig.alt ?? playListItemConfig.title}
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
              onClick={(e) => handlePlayBtnClick(e, playListItemConfig.id)}
            >
              <PFPlayCircleFilled />
            </div>
          </div>
          <div className='flexCol flex-1 min-w-0 select-none'>
            <Typography type='caption1' overflow='ellipsis' className='text-gray-50'>
              {playListItemConfig.title}
            </Typography>
            <Typography type='caption1' className='self-end text-gray-400'>
              {playListItemConfig.duration}
            </Typography>
          </div>
        </div>
      )}
    </DisplayOptionMenuOnHoverListener>
  );
};

export default PlayListItem;
