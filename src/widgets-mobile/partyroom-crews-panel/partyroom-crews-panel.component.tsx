'use client';

import Image from 'next/image';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { useOpenCrewProfile } from '@/features/view-crew-profile';
import { cn } from '@/shared/lib/functions/cn';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * 모바일 크루 패널 (§4.3):
 * - 세그먼트 헤더 "N명 청취 중" (scroll container 기준 sticky top-0 — display-board
 *   sticky 와 충돌 회피)
 * - 1컬럼 리스트, 각 row = avatarIconUri 32×32 + nickname + DJ 표식
 * - DJ 식별: state.currentDj?.crewId === crew.crewId (Crew.Model 에 isDj 필드 없음)
 * - 모더레이션 액션 X (§OUT)
 */
const MobilePartyroomCrewsPanel: FC = () => {
  const crews = useCurrentPartyroomCrews();
  const openCrewProfile = useOpenCrewProfile();
  const { useCurrentPartyroom } = useStores();
  const currentDj = useCurrentPartyroom((state) => state.currentDj);

  return (
    <div className='w-full'>
      <div
        className={cn(
          'sticky top-0 z-[5] bg-black px-4 py-2',
          'text-xs text-gray-400 border-b border-gray-800'
        )}
      >
        {crews.length}명 청취 중
      </div>
      <ul className='divide-y divide-gray-900'>
        {crews.map((crew) => {
          const isDj = currentDj?.crewId === crew.crewId;
          return (
            <li key={crew.crewId} className='flex items-center gap-3 px-4 py-3 min-h-[44px]'>
              <button
                type='button'
                onClick={() => openCrewProfile(crew.crewId)}
                aria-label={`${crew.nickname} 프로필 보기`}
                className='flex min-w-0 flex-1 items-center gap-3'
              >
                <div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-800 shrink-0'>
                  {crew.avatarIconUri && (
                    <Image src={crew.avatarIconUri} alt='' fill className='object-cover' />
                  )}
                </div>
                <span className='text-sm text-white truncate flex-1 text-left'>
                  {crew.nickname}
                </span>
              </button>
              {isDj && <span className='text-[10px] text-red-400 font-bold shrink-0'>DJ</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MobilePartyroomCrewsPanel;
