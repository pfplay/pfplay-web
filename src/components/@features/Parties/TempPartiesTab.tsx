'use client';
import { Tab } from '@headlessui/react';

// const tabList: { src: string; alt: string }[] = [
//   { src: '/icons/icn_person_outline.svg', alt: '채팅' },
//   { src: '/icons/icn_chat_filled.svg', alt: '채팅' },
// ];

// FIXME: 임의로 만든 컴포넌트입니다. Tab Atom 준비되면 대체해주세요.
const TempPartiesTab = () => {
  return (
    <Tab.Group>
      {/*<Tab.List className={cn('w-full flex space-x-1 rounded-xl p-1')}>*/}
      {/*  {tabList.map((value) => (*/}
      {/*    <Tab*/}
      {/*      key={value.src}*/}
      {/*      className={({ selected }) =>*/}
      {/*        cn(*/}
      {/*          'w-full flexRowCenter  pt-3 pb-4 border-b-[1px] text-sm font-medium leading-5  bg-transparent outline-none',*/}
      {/*          selected ? 'text-white shadow border-red-400' : 'text-gray-500 border-gray-500 '*/}
      {/*        )*/}
      {/*      }*/}
      {/*    >*/}
      {/*      {() => (*/}
      {/*        <>*/}
      {/*          /!* TODO: selected prop에 따라 svg fill/outline 바꿔주기  or 모든  svg를 component화 시켜서 조건에 따라 prop(e.g. fill, stroke) passing하기*!/*/}
      {/*          <Image src={value.src} alt='채팅' width={20} height={20} />*/}
      {/*          <span className='inline-block ml-1.5 font-medium leading-relaxed'>채팅</span>*/}
      {/*        </>*/}
      {/*      )}*/}
      {/*    </Tab>*/}
      {/*  ))}*/}
      {/*</Tab.List>*/}
    </Tab.Group>
  );
};

export default TempPartiesTab;
