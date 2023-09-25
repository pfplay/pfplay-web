'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { mockAvatarBodyList } from '@/constants/__mock__/mockAvatarBodyList';
import { cn } from '@/utils/cn';
import AvatarBody, { AvatarBodyImg } from './AvatarBody';
import AvatarFace from './AvatarFace';

const avatarSettingTabConfig: Array<{ name: 'body' | 'face'; index: number }> = [
  { name: 'body', index: 0 },
  { name: 'face', index: 1 },
];

const AvatarSettingForm = () => {
  const [selectedBody, setSelectedBody] = useState<AvatarBodyImg>(mockAvatarBodyList[0]);

  return (
    <div className='flexRow gap-[30px]'>
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
          <Tab.List className={cn('w-full flex space-x-1 max-w-xs')}>
            {avatarSettingTabConfig.map((tab) => (
              // TODO: Tab 컴포넌트 Atom으로 분리하기
              <Tab
                key={tab.index}
                className={({ selected }) =>
                  cn(
                    'w-[101px] flexRowCenter py-2 px-6 border-b-[1px] bg-transparent outline-none text-xl font-bold text-gray-500 border-gray-500 uppercase',
                    selected && 'text-red-400  border-red-700'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel tabIndex={avatarSettingTabConfig[0].index}>
              <AvatarBody selectedBody={selectedBody} setSelectedBody={setSelectedBody} />
            </Tab.Panel>
            <Tab.Panel tabIndex={avatarSettingTabConfig[1].index}>
              <AvatarFace />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AvatarSettingForm;
