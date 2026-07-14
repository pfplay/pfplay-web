'use client';

import { FC } from 'react';
import { MobilePartyroomList } from '@/features-mobile/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import LobbyMenu from './lobby-menu.component';

/**
 * 모바일 로비 page-level shell (§4.4 · §4.5).
 *
 * 데스크탑 `<Header />` 는 page.tsx 가 desktop 분기에서만 렌더 — 모바일 로비는 자체
 * 헤더("파티 찾기" + ⋮) 가짐 (스펙 §4.5). ⋮ 는 `LobbyMenu` 가 소유 — 알림 설정/로그아웃
 * 진입점(Web Push 설정).
 *
 * `MobilePartyroomList` 내부의 `useSuspenseFetchMainPartyroom` (Main Stage 카드) 가
 * Suspense boundary 를 요구. 데스크탑 lobby 와 동일 패턴.
 */
const MobileLobby: FC = () => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <header className='sticky top-0 z-10 bg-black border-b border-gray-900 px-4 h-12 flex items-center justify-between'>
        <h1 className='text-base font-semibold text-white'>파티 찾기</h1>
        <LobbyMenu />
      </header>
      <div className='flex-1 px-app pt-4 pb-8'>
        <SuspenseWithErrorBoundary enableReload>
          <MobilePartyroomList />
        </SuspenseWithErrorBoundary>
      </div>
    </main>
  );
};

export default MobileLobby;
