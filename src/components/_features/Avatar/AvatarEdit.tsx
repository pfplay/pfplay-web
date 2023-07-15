'use client';
import GoBackButton from '@/components/GoBackButton';
import Tabs from '@/components/Tabs';
import { cn } from '@/lib/utils';
import { Tab } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import React from 'react';

const AvatarEdit = () => {
  const router = useRouter();

  return (
    <div className='w-full bg-[#111111] pt-[120px] px-12'>
      <div onClick={() => router.back()}>
        <GoBackButton title='뭘 입고 놀아볼까요?' />
      </div>
      <div className='flex gap-[30px]'>
        {/* 아바타 미리보기 */}
        <div className='bg-[#000] min-w-[400px] h-[620px]'>avatar preview</div>
        {/* 아이템 설정 */}
        <div className='flex-col w-full'>
          <Tabs>
            {['BODY', 'FACE'].map((value) => (
              <Tab
                key={value}
                className={({ selected }) =>
                  cn(
                    'w-full flexRowCenter  pt-3 pb-4 border-b-[1px] text-sm font-medium leading-5  bg-transparent outline-none',
                    selected ? 'text-red-3 shadow border-red-3' : 'text-[#545454] border-[#545454] '
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

export default AvatarEdit;

