'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import GoBackButton from '@/components/GoBackButton';
import { avatarBodyMockArr } from '@/config/profile-body-mock';
import { cn } from '@/lib/utils';
import AvatarBody, { AvatarBodyImg } from './AvatarBody';
import AvatarFace from './AvatarFace';

const avatarSettingTabConfig: Array<{ name: 'body' | 'face'; index: number }> = [
  { name: 'body', index: 0 },
  { name: 'face', index: 1 },
];

const AvatarSettings = () => {
  const [selectedBody, setSelectedBody] = useState<AvatarBodyImg>(avatarBodyMockArr[0]);

  return (
    <section className='max-w-[1680px] bg-grey-900  mx-auto pt-[46px] pb-12 px-[60px] flexCol gap-9'>
      <GoBackButton text='뭘 입고 놀아볼까요?' className='self-start' />
      <div className='flex gap-[30px] '>
        {/* 아바타 미리보기 */}
        <div className='relative flexRow items-center bg-black'>
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
        <div className='flex-col w-full'>
          <Tab.Group>
            <Tab.List className={cn('w-full flex space-x-1 max-w-xs')}>
              {avatarSettingTabConfig.map((tab) => (
                // TODO: Tab 컴포넌트 Atom으로 분리하기
                <Tab
                  key={tab.index}
                  className={({ selected }) =>
                    cn(
                      'w-[101px] flexRowCenter py-2 px-6 border-b-[1px] bg-transparent outline-none text-xl font-bold text-grey-500 border-grey-500 uppercase',
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
    </section>
  );
};

export default AvatarSettings;
