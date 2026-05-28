'use client';

import { FC } from 'react';
import { useFetchGeneralPartyrooms } from '@/features/partyroom/list/api/use-fetch-general-partyrooms.query';
import MobilePartyroomCard from './partyroom-card.component';

/**
 * 모바일 로비 1컬럼 카드 리스트.
 *
 * useFetchGeneralPartyrooms 는 regular useQuery (infinite 아님) — 반환 = PartyroomSummary[].
 * 데스크탑 hooks 그대로 재사용 (스펙 §1.6 entities/features 공통 경계).
 */
const MobilePartyroomList: FC = () => {
  const { data } = useFetchGeneralPartyrooms();
  const rooms = data ?? [];

  if (rooms.length === 0) {
    return (
      <div className='w-full py-12 text-center text-sm text-gray-500'>
        지금 열려 있는 파티가 없어요.
      </div>
    );
  }

  return (
    <ul className='flexCol gap-4 w-full'>
      {rooms.map((summary) => (
        <li key={summary.partyroomId}>
          <MobilePartyroomCard roomId={summary.partyroomId} summary={summary} />
        </li>
      ))}
    </ul>
  );
};

export default MobilePartyroomList;
