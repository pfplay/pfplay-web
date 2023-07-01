'use client';
import { Tab } from '@headlessui/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// TODO: Tabs 컴포넌트 Refactoring하기.
// 같이 정해요: 1. generic component, 2. Compound component, e. Dedicated component
type TabObj = { src: string; alt: string };
const tabList: TabObj[] = [
  { src: '/icons/icn_person_outline.svg', alt: '채팅' },
  { src: '/icons/icn_chat_filled.svg', alt: '채팅' },
];

interface TabsProps {
  classNames?: string;
}

export const Tabs = ({ children, classNames = '' }: React.PropsWithChildren<TabsProps>) => {
  return (
    <div className='w-full max-w-md px-2 py-16 sm:px-0'>
      <Tab.Group>
        <Tab.List className='flex space-x-1 rounded-xl p-1'>
          {children ? (
            children
          ) : (
            <>
              {tabList.map((value) => (
                <Tab
                  key={value.src}
                  className={({ selected }) =>
                    cn(
                      'w-full flexRowCenter  pt-3 pb-4 border-b-[1px] text-sm font-medium leading-5  bg-transparent outline-none',
                      classNames,
                      selected
                        ? 'text-white shadow border-red-3'
                        : 'text-[#545454] border-[#545454] '
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      {/* TODO: selected prop에 따라 svg fill/outline 바꿔주기  or 모든  svg를 component화 시켜서 조건에 따라 prop(e.g. fill, stroke) passing하기*/}
                      <Image src={value.src} alt='채팅' width={20} height={20} />
                      <span className='inline-block ml-1.5 font-medium leading-relaxed'>채팅</span>
                    </>
                  )}
                </Tab>
              ))}
            </>
          )}
        </Tab.List>
      </Tab.Group>
    </div>
  );
};

