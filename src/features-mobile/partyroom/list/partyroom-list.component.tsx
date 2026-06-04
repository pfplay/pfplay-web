'use client';

import { FC } from 'react';
import { useFetchGeneralPartyrooms } from '@/features/partyroom/list/api/use-fetch-general-partyrooms.query';
import { useSuspenseFetchMainPartyroom } from '@/features/partyroom/list/api/use-fetch-main-partyroom.query';
import { MobilePartyroomCreateCard } from '@/features-mobile/partyroom/create';
import MobilePartyroomCard from './partyroom-card.component';

/**
 * 모바일 로비 1컬럼 카드 리스트.
 *
 * 데스크탑 lobby 가 `MainPartyroomCard` (MAIN stage) + `PartyroomList` (GENERAL) 두 영역
 * 으로 나눠 노출하는 것을 모바일에서는 1컬럼 통합 — Main 카드를 General 리스트 맨 앞에
 * prepend. 모바일은 좌우 폭이 좁아 hero blur card 의 visual hierarchy 효과가 약하므로
 * 동일 카드 디자인 유지, 위치만 최상단.
 *
 * 리스트 맨 위에 host CTA(`MobilePartyroomCreateCard`, 이슈 #381 옵션 B) 를 둬 방만들기
 * 진입점을 파티룸 목록과 같은 컨테이너 안에 노출한다. 열린 파티가 없어도 CTA 는 항상 보인다.
 *
 * - `useSuspenseFetchMainPartyroom` (suspense) + `useFetchGeneralPartyrooms` 는 같은
 *   `/api/v1/partyrooms` getList 응답을 query key 공유로 단일 fetch + 다른 select.
 * - Suspense boundary 는 호출자(`MobileLobby`)가 `SuspenseWithErrorBoundary` 로 처리.
 */
const MobilePartyroomList: FC = () => {
  const { data: mainRoom } = useSuspenseFetchMainPartyroom();
  const { data: generalRooms } = useFetchGeneralPartyrooms();

  const hasRooms = !!mainRoom || (generalRooms?.length ?? 0) > 0;

  return (
    <ul className='flexCol gap-4 w-full'>
      <li>
        <MobilePartyroomCreateCard />
      </li>
      {mainRoom && (
        <li key={mainRoom.partyroomId}>
          <MobilePartyroomCard roomId={mainRoom.partyroomId} summary={mainRoom} isMain />
        </li>
      )}
      {generalRooms?.map((summary) => (
        <li key={summary.partyroomId}>
          <MobilePartyroomCard roomId={summary.partyroomId} summary={summary} />
        </li>
      ))}
      {!hasRooms && (
        <li className='w-full py-12 text-center text-sm text-gray-500'>
          지금 열려 있는 파티가 없어요.
        </li>
      )}
    </ul>
  );
};

export default MobilePartyroomList;
