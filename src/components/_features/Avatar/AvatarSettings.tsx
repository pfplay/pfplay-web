'use client';
import React from 'react';
import { Tab } from '@headlessui/react';
import GoBackButton from '@/components/GoBackButton';
import { cn } from '@/lib/utils';

const AvatarSettings = () => {
  // const router = useRouter();

  return (
    <section className='min-w-[1000px] bg-grey-900  mx-auto pt-[46px] pb-12 px-[60px]'>
      <GoBackButton text='뭘 입고 놀아볼까요?' className='self-start' />
      <div className='flex gap-[30px]'>
        {/* 아바타 미리보기 */}
        <div className='bg-black min-w-[300px] h-[520px]'>avatar preview</div>
        {/* 아이템 설정 */}
        <div className='flex-col w-full bg-white'>
          <Tab.Group>
            <Tab.List className={cn('w-full flex space-x-1 rounded-xl p-1 max-w-xs')}>
              {['BODY', 'FACE'].map((value) => (
                // TODO: Tab 컴포넌트 Atom으로 분리하기
                <Tab
                  key={value}
                  className={({ selected }) =>
                    cn(
                      'w-[101px] flexRowCenter py-3 px-6 border-b-[1px] text-xl font-bold leading-5  bg-transparent outline-none',
                      selected
                        ? 'text-red-400 shadow border-red-700'
                        : 'text-grey-500 border-grey-500 '
                    )
                  }
                >
                  {value}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>Content 1</Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </section>
  );
};

export default AvatarSettings;
