'use client';
import { FC } from 'react';
import { useFetchMe } from '@/entities/me';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useMobileChangeMyPlaylist } from '@/features-mobile/partyroom/change-my-playlist';
import { useMobileRegisterMeToQueue } from '@/features-mobile/partyroom/register-me-to-queue';
import { useMobileUnregisterMeFromQueue } from '@/features-mobile/partyroom/unregister-me-from-queue';
import { AuthorityTier, QueueStatus } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import { FullscreenSheetProvider, SheetHost } from '@/widgets-mobile/partyroom-djing-sheet';
import CurrentDjRow from './current-dj-row.component';
import GuestCta from './guest-cta.component';
import MemberActions from './member-actions.component';
import QueueList from './queue-list.component';

interface Props {
  partyroomId: number;
}

const QueuePanelContent: FC<Props> = ({ partyroomId }) => {
  const { data: me } = useFetchMe();
  const isGuest = me?.authorityTier === AuthorityTier.GT;
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const { useCurrentPartyroom } = useStores();
  const myCrewId = useCurrentPartyroom((s) => s.me?.crewId);
  const { data: playlists = [] } = useFetchPlaylists();

  const djs = djingQueue?.djs ?? [];
  const playback = djingQueue?.playback;
  const queueStatus = djingQueue?.queueStatus ?? QueueStatus.OPEN;
  const isMeInQueue = djs.some((dj) => dj.crewId === myCrewId);
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  const currentDj = sorted[0];

  const register = useMobileRegisterMeToQueue({ partyroomId, queueStatus, playlists });
  const change = useMobileChangeMyPlaylist({ partyroomId, playlists });
  const unregister = useMobileUnregisterMeFromQueue({ partyroomId });

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
      <MemberActions isMeInQueue={isMeInQueue} onRegister={register} onUnregister={unregister} />
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
