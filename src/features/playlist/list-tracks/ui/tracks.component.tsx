import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePlaylistAction } from '@/entities/playlist';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { Playlist, PlaylistTrack } from '@/shared/api/http/types/playlists';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { parseDurationToSeconds } from '@/shared/lib/functions/parse-duration';
import { resolveNextTrackId } from '@/shared/lib/functions/resolve-next-track';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFAddPlaylist, PFDelete } from '@/shared/ui/icons';
import Track from './track.component';
import { useFetchPlaylistTracks } from '../api/use-fetch-playlist-tracks.query';

const logger = withDebugger(0);
const errorLogger = logger(errorLog);

type TracksInPlaylistProps = {
  playlist: Playlist;
};

const TracksInPlaylist = ({ playlist }: TracksInPlaylistProps) => {
  const t = useI18n();
  const params = useParams<{ id: string }>();
  const partyroomId = Number(params.id);
  const { data: summary } = useFetchPartyroomDetailSummary(partyroomId, !!partyroomId);
  const limitMin = summary?.playbackTimeLimit ?? 0;
  const { data } = useFetchPlaylistTracks(playlist.id);
  const playlistAction = usePlaylistAction();
  const [me, currentDj] = useStores().useCurrentPartyroom((state) => [state.me, state.currentDj]);

  const [items, setItems] = useState<PlaylistTrack[]>([]);

  // 재생 커서(NOW 앵커). NEXT는 커서 + 현재(낙관적 재정렬 반영) 순서로부터 파생 → refetch 불필요.
  const cursor = data?.lastPlayedTrackId ?? null;
  // NOW/NEXT 모두 내가 CurrentDJ일 때(방 안)만. 방 밖에선 currentDj가 없어 자연히 비활성.
  // resolveNextTrackId는 커서가 없으면 첫 트랙을 돌려주므로, 게이트가 없으면 디제잉과
  // 무관한 모든 플레이리스트의 첫 곡에 NEXT가 붙는다.
  const isMeCurrentDj = me?.crewId != null && me.crewId === currentDj?.crewId;
  const nextTrackId = isMeCurrentDj
    ? resolveNextTrackId(
        items.map((track) => track.trackId),
        cursor
      )
    : null;
  const nowTrackId = isMeCurrentDj ? cursor : null;

  useEffect(() => {
    if (data?.content) {
      setItems(data.content);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.linkId === active.id);
    const newIndex = items.findIndex((item) => item.linkId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const activeTrack = items.find((track) => track.linkId === active.id);
    if (!activeTrack) return;

    try {
      setItems(arrayMove(items, oldIndex, newIndex));

      await playlistAction.changeTrackOrder({
        playlistId: playlist.id,
        trackId: activeTrack.trackId,
        nextOrderNumber: newIndex + 1, // orderNumber는 1부터 시작하므로 +1
      });
    } catch (error) {
      errorLogger('Failed to update track order:', error);
      if (data?.content) {
        setItems(data.content);
      }
    }
  };

  if (!items.length) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={items.map((track) => track.linkId)}
        strategy={verticalListSortingStrategy}
      >
        <div className='flex flex-col gap-3'>
          {items.map((track) => {
            const sec = parseDurationToSeconds(track.duration);
            const isOverRoomLimit = limitMin > 0 && sec !== null && sec > limitMin * 60;
            const isNow = nowTrackId !== null && track.trackId === nowTrackId;
            // NOW==NEXT(1곡) 겹침 시 NOW만 표시 → isNext는 isNow가 아닐 때만.
            const isNext = !isNow && nextTrackId !== null && track.trackId === nextTrackId;
            return (
              <Track
                key={track.linkId}
                track={track}
                isOverRoomLimit={isOverRoomLimit}
                isNow={isNow}
                isNext={isNext}
                menuItems={[
                  {
                    onClickItem: () => playlistAction.removeTrack(playlist.id, track.trackId),
                    label: t.playlist.btn.delete_playlist,
                    Icon: <PFDelete />,
                  },
                  {
                    onClickItem: () => playlistAction.moveTrack(playlist.id, track.trackId),
                    label: t.playlist.btn.move_playlist,
                    Icon: <PFAddPlaylist />,
                  },
                ]}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TracksInPlaylist;
