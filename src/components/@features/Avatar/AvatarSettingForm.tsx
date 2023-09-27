'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import CustomTab from '@/components/@shared/@atoms/CustomTab';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import { cn } from '@/utils/cn';
import AvatarBody from './AvatarBody';
import AvatarFace from './AvatarFace';
import { AvatarImg } from './AvatarImage';

const avatarSettingTabConfig: Array<{ name: 'body' | 'face'; index: number }> = [
  { name: 'body', index: 0 },
  { name: 'face', index: 1 },
];

const AvatarSettingForm = () => {
  const [selectedBody, setSelectedBody] = useState<AvatarImg>(mockAvatarBodyList[0]);
  const [selectedFace, setSelectedFace] = useState<AvatarImg>(mockAvatarBodyList[0]); // FIXME: Avatar face type 정해면 재정의

  return (
    <div className='flexRow gap-[60px]'>
      {/* 아바타 미리보기 */}
      <div className='h-full flexRow items-center bg-black select-none pointer-events-none'>
        {/* // TODO: Component화 시키고 반응형으로 만들기 */}
        <Image
          src={selectedBody.image}
          alt={selectedBody.name}
          width={300}
          height={300}
          sizes='(max-width:300px)'
          className='bg-black min-w-[300px]'
        />
      </div>
      {/* 아이템 설정 */}
      <div className='flexCol w-full'>
        <Tab.Group>
          <Tab.List className={cn('w-full flexRow')}>
            <div className='flexRow max-w-xs'>
              {avatarSettingTabConfig.map((tab) => (
                <CustomTab key={tab.index} tabTitle={tab.name} variant='line' />
              ))}
            </div>
            <div className='flex-1 border-b-[1px] border-b-gray-400' />
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel tabIndex={avatarSettingTabConfig[0].index}>
              <AvatarBody selectedBody={selectedBody} setSelectedBody={setSelectedBody} />
            </Tab.Panel>
            <Tab.Panel tabIndex={avatarSettingTabConfig[1].index}>
              <AvatarFace selectedFace={selectedFace} setSelectedFace={setSelectedFace} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AvatarSettingForm;
