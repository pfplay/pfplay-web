'use client';
import React, { FC, useState } from 'react';
import { Tab } from '@headlessui/react';
import GoBackButton from '@/components/GoBackButton';
import { cn } from '@/lib/utils';
import AvatarBody from './AvatarBody';
import AvatarFace from './AvatarFace';

const avatarSettingTabConfig: Array<{ name: 'body' | 'face'; component: FC; index: number }> = [
  { name: 'body', index: 0, component: AvatarBody },
  { name: 'face', index: 1, component: AvatarFace },
];

const AvatarSettings = () => {
  const [selectedIndex, setSelectedIndex] = useState(avatarSettingTabConfig[0].index);

  console.log({ selectedIndex });

  return (
    <section className='min-w-[1000px] bg-grey-900  mx-auto pt-[46px] pb-12 px-[60px]'>
      <GoBackButton text='뭘 입고 놀아볼까요?' className='self-start' />
      <div className='flex gap-[30px] '>
        {/* 아바타 미리보기 */}
        <div className='bg-black min-w-[300px] h-[520px]'>avatar preview</div>
        {/* 아이템 설정 */}
        <div className='flex-col w-full'>
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className={cn('w-full flex space-x-1 rounded-xl p-1 max-w-xs')}>
              {avatarSettingTabConfig.map((tab) => (
                // TODO: Tab 컴포넌트 Atom으로 분리하기
                <Tab
                  key={tab.index}
                  className={({ selected }) =>
                    cn(
                      'w-[101px] flexRowCenter py-3 px-6 border-b-[1px] text-xl font-bold leading-5  bg-transparent outline-none uppercase',
                      selected
                        ? 'text-red-400 shadow border-red-700'
                        : 'text-grey-500 border-grey-500 '
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {avatarSettingTabConfig.map((tab) => (
                <Tab.Panel key={tab.index}>
                  <tab.component />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </section>
  );
};

export default AvatarSettings;
