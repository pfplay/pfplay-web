'use client';

import { FC } from 'react';
import { MobilePartyroomList } from '@/features-mobile/partyroom/list';

/**
 * 모바일 로비 page-level shell (§4.4 · §4.5).
 *
 * 데스크탑 `<Header />` 는 page.tsx 가 desktop 분기에서만 렌더 — 모바일 로비는 자체
 * 헤더("파티 찾기" + ⋮) 가짐 (스펙 §4.5). ⋮ 메뉴 확장은 chunk 3·4 에서.
 */
const MobileLobby: FC = () => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <header className='sticky top-0 z-10 bg-black border-b border-gray-900 px-4 h-12 flex items-center justify-between'>
        <h1 className='text-base font-semibold text-white'>파티 찾기</h1>
        <button
          aria-label='메뉴'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
        >
          ⋮
        </button>
      </header>
      <div className='flex-1 px-app pt-4 pb-8'>
        <MobilePartyroomList />
      </div>
    </main>
  );
};

export default MobileLobby;
