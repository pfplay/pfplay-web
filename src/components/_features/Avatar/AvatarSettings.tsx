'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Tab } from '@headlessui/react';
import GoBackButton from '@/components/GoBackButton';
import Tabs from '@/components/Tabs';
import { cn } from '@/lib/utils';

const AvatarSettings = () => {
  const router = useRouter();

  return (
    <div className='w-full bg-black pt-[120px] px-12'>
      <div>
        <GoBackButton text='뭘 입고 놀아볼까요?' onClick={() => router.back()} />
      </div>
      <div className='flex gap-[30px]'>
        {/* 아바타 미리보기 */}
        <div className='bg-black min-w-[400px] h-[620px]'>avatar preview</div>
        {/* 아이템 설정 */}
        <div className='flex-col w-full'>
          <Tabs>
            {['BODY', 'FACE'].map((value) => (
              <Tab
                key={value}
                className={({ selected }) =>
                  cn(
                    'w-full flexRowCenter  pt-3 pb-4 border-b-[1px] text-sm font-medium leading-5  bg-transparent outline-none',
                    selected
                      ? 'text-red-400 shadow border-red-400'
                      : 'text-grey-500 border-grey-500 '
                  )
                }
              >
                <span className='inline-block ml-1.5 font-medium leading-relaxed'>{value}</span>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AvatarSettings;