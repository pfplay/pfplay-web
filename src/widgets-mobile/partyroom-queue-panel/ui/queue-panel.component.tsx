'use client';
import { FC } from 'react';
import { useFetchMe } from '@/entities/me';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useMobileChangeMyPlaylist } from '@/features-mobile/partyroom/change-my-playlist';
import { useMobileRegisterMeToQueue } from '@/features-mobile/partyroom/register-me-to-queue';
import { useMobileUnregisterMeFromQueue } from '@/features-mobile/partyroom/unregister-me-from-queue';
import { useOpenPlaylistsManagement } from '@/features-mobile/playlist/manage';
import { AuthorityTier, QueueStatus } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import { FullscreenSheetProvider, SheetHost } from '@/widgets-mobile/partyroom-djing-sheet';
import CurrentDjRow from './current-dj-row.component';
import GuestCta from './guest-cta.component';
import MemberActions from './member-actions.component';
import QueueList from './queue-list.component';
import QueuePositionSummary from './queue-position-summary.component';

interface Props {
  partyroomId: number;
}

const QueuePanelContent: FC<Props> = ({ partyroomId }) => {
  const { data: me } = useFetchMe();
  const isGuest = me?.authorityTier === AuthorityTier.GT;
  // 게스트(GT)는 playlists 사용처(register/change DJ slot)에 도달하지 않으므로 호출 자체를 skip.
  // me 가 아직 fetch 안 된 시점도 enabled=false 로 안전 — 데스크탑 playlist-action.provider 와 동일 패턴.
  const isMember = !!me && me.authorityTier !== AuthorityTier.GT;
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const { useCurrentPartyroom } = useStores();
  const myCrewId = useCurrentPartyroom((s) => s.me?.crewId);
  const { data: playlists = [] } = useFetchPlaylists({ enabled: isMember });

  const djs = djingQueue?.djs ?? [];
  const playback = djingQueue?.playback;
  const queueStatus = djingQueue?.queueStatus ?? QueueStatus.OPEN;
  const isMeInQueue = djs.some((dj) => dj.crewId === myCrewId);
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  const currentDj = sorted[0];
  // 좁은 모바일 큐에서 "내 차례"를 한눈에. myIndex>=0 == isMeInQueue.
  const myIndex = sorted.findIndex((dj) => dj.crewId === myCrewId);

  const register = useMobileRegisterMeToQueue({ partyroomId, queueStatus, playlists });
  const change = useMobileChangeMyPlaylist({ partyroomId, playlists });
  const unregister = useMobileUnregisterMeFromQueue({ partyroomId });
  const openManage = useOpenPlaylistsManagement();

  if (isGuest) {
    return (
      <div className='flex flex-col h-full'>
        <div className='flex-1 overflow-y-auto'>
          {currentDj && playback && (
            <CurrentDjRow dj={currentDj as never} playback={playback as never} />
          )}
          <QueueList djs={djs} myCrewId={undefined} onChangePlaylist={() => undefined} />
        </div>
        <GuestCta />
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 overflow-y-auto'>
        {currentDj && playback && (
          <CurrentDjRow dj={currentDj as never} playback={playback as never} />
        )}
        <QueueList djs={djs} myCrewId={myCrewId} onChangePlaylist={change} />
      </div>
      {/* 내가 현재 DJ(1번)면 CurrentDjRow 가 이미 보여주므로 대기 중일 때만 노출. */}
      {myIndex > 0 && <QueuePositionSummary position={myIndex + 1} total={sorted.length} />}
      <MemberActions
        isMeInQueue={isMeInQueue}
        onRegister={register}
        onUnregister={unregister}
        onManagePlaylists={openManage}
      />
    </div>
  );
};

const MobilePartyroomQueuePanel: FC<Props> = ({ partyroomId }) => (
  <FullscreenSheetProvider>
    <QueuePanelContent partyroomId={partyroomId} />
    <SheetHost />
  </FullscreenSheetProvider>
);

export default MobilePartyroomQueuePanel;
