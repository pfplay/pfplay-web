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
import { Playlist } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFPlaylistAdd, PFSearch } from '@/shared/ui/icons';
import CurrentDjRow from '@/widgets-mobile/partyroom-queue-panel/ui/current-dj-row.component';
import GuestCta from '@/widgets-mobile/partyroom-queue-panel/ui/guest-cta.component';
import MemberActions from '@/widgets-mobile/partyroom-queue-panel/ui/member-actions.component';
import QueueList from '@/widgets-mobile/partyroom-queue-panel/ui/queue-list.component';
import QueuePositionSummary from '@/widgets-mobile/partyroom-queue-panel/ui/queue-position-summary.component';
import RegisterTrackSheet from './register-track-sheet.component';
import { useFullscreenSheet } from '../lib/use-fullscreen-sheet.hook';

interface Props {
  partyroomId: number;
  queueStatus?: QueueStatus;
  playlists?: Playlist[];
}

const NowDjingSheet: FC<Props> = ({ partyroomId, queueStatus, playlists }) => {
  const t = useI18n();
  const { data: me } = useFetchMe();
  const isGuest = me?.authorityTier === AuthorityTier.GT;
  const isMember = !!me && me.authorityTier !== AuthorityTier.GT;
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId });
  const { data: fetchedPlaylists = [] } = useFetchPlaylists({ enabled: isMember });
  const { useCurrentPartyroom } = useStores();
  const myCrewId = useCurrentPartyroom((s) => s.me?.crewId);
  const { push, closeAll } = useFullscreenSheet();

  const djs = djingQueue?.djs ?? [];
  const playback = djingQueue?.playback;
  const sorted = [...djs].sort((a, b) => a.orderNumber - b.orderNumber);
  const currentDj = sorted[0];
  const myIndex = sorted.findIndex((dj) => dj.crewId === myCrewId);
  const isMeInQueue = myIndex >= 0;
  const availablePlaylists = playlists ?? fetchedPlaylists;

  const resolvedQueueStatus = queueStatus ?? djingQueue?.queueStatus;

  const registerFromPlaylist = useMobileRegisterMeToQueue({
    partyroomId,
    queueStatus: resolvedQueueStatus ?? QueueStatus.OPEN,
    playlists: availablePlaylists,
    onRegistered: closeAll,
  });
  const changePlaylist = useMobileChangeMyPlaylist({
    partyroomId,
    playlists: availablePlaylists,
  });
  const unregister = useMobileUnregisterMeFromQueue({ partyroomId });
  const openPlaylistsManagement = useOpenPlaylistsManagement();

  const openRegisterTrackSheet = () =>
    push({
      key: 'register-track',
      title: t.dj.title.select_song,
      node: <RegisterTrackSheet partyroomId={partyroomId} />,
    });

  return (
    <div className='flex h-full flex-col px-4 pb-4'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        {currentDj && playback ? (
          <CurrentDjRow dj={currentDj as never} playback={playback as never} />
        ) : (
          <div className='flex items-center justify-center h-[100%] text-center'>
            <p className='whitespace-pre-line text-[18px] font-bold leading-[1.45] text-gray-400'>
              {t.dj.para.no_dj_crew}
            </p>
          </div>
        )}
        <QueueList
          djs={djs}
          myCrewId={isGuest ? undefined : myCrewId}
          onChangePlaylist={isGuest ? () => undefined : changePlaylist}
        />
      </div>

      {/* 내가 현재 DJ(1번)면 CurrentDjRow 가 이미 보여주므로 대기 중일 때만 노출. */}
      {myIndex > 0 && <QueuePositionSummary position={myIndex + 1} total={sorted.length} />}

      {isGuest ? (
        <GuestCta />
      ) : isMeInQueue ? (
        <MemberActions
          isMeInQueue
          onRegister={() => undefined}
          onUnregister={unregister}
          onManagePlaylists={openPlaylistsManagement}
        />
      ) : (
        <div className='shrink-0 mb-11'>
          <button
            type='button'
            data-testid='now-djing-register-by-search'
            disabled={!resolvedQueueStatus}
            className='mb-4 flex h-[56px] w-full items-center justify-center gap-3 rounded-sm bg-red-500 text-[18px] font-bold text-white disabled:bg-gray-800 disabled:text-gray-600'
            onClick={openRegisterTrackSheet}
          >
            <PFSearch width={24} height={24} aria-hidden='true' />
            {t.dj.btn.search_and_register_dj}
          </button>
          <button
            type='button'
            data-testid='now-djing-register-by-playlist'
            disabled={!resolvedQueueStatus}
            className='flex h-[56px] w-full items-center justify-center gap-3 rounded-sm bg-gray-700 text-[18px] font-bold text-white disabled:bg-gray-800 disabled:text-gray-600'
            onClick={() => void registerFromPlaylist()}
          >
            <PFPlaylistAdd width={24} height={24} aria-hidden='true' />
            {t.dj.btn.pick_from_my_playlist}
          </button>
        </div>
      )}
    </div>
  );
};

export default NowDjingSheet;
