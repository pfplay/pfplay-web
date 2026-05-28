'use client';

import { PartyroomCreateCard } from '@/features/partyroom/create';
import { MainPartyroomCard, PartyroomList } from '@/features/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Sidebar } from '@/widgets/sidebar';
import { DesktopOverlays } from './desktop-overlays.component';

/**
 * 데스크탑 로비 페이지 본문.
 *
 * 기존: `src/app/parties/(lobby)/page.tsx` body
 * + `src/app/parties/(lobby)/layout.tsx` 의 main wrapper
 * + DesktopOverlays (ProtectedLayout 에서 추출).
 *
 * Header 는 본 컴포넌트에 포함하지 않음 — `widgets/layouts` barrel 이 RSC-only
 * Footer(next/headers 의존) 를 함께 export 해서 본 'use client' 트리에 끌고
 * 들어오면 빌드 실패. page.tsx (RSC) 가 Header 와 본 컴포넌트를 sibling 으로 렌더.
 *
 * 모바일 트리는 별도(`widgets-mobile/partyroom-page-mobile/lobby`, chunk 2).
 */
export const DesktopLobby = () => {
  const router = useAppRouter();

  return (
    <>
      <main className='px-app pt-app pb-app overflow-y-auto'>
        <Sidebar
          onClickAvatarSetting={() => {
            router.push('/settings/avatar');
          }}
          className={cn([
            'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
            'fixed z-10 bottom-8 right-8 transform',
            'laptop:bottom-[unset] laptop:right-[unset] laptop:top-1/2 laptop:left-8 laptop:-translate-y-1/2',
          ])}
        />

        <div className='max-w-desktop mx-auto'>
          <SuspenseWithErrorBoundary enableReload>
            <MainPartyroomCard />
          </SuspenseWithErrorBoundary>

          <section
            className={cn([
              'grid gap-[1.5rem] mt-6 overflow-y-auto',
              'grid-rows-[240px] auto-rows-[240px] grid-flow-row-dense',
              'grid-cols-1',
              'tablet:grid-cols-[repeat(auto-fit,calc((100%-1.5rem)/2))]', // 100%-{COL_GAP}
              'desktop:grid-cols-[repeat(auto-fit,calc((100%-3rem)/3))]', // 100%-({COL_GAP}*2)
            ])}
          >
            <PartyroomCreateCard />

            <PartyroomList trackView />
          </section>
        </div>
      </main>
      <DesktopOverlays />
    </>
  );
};
