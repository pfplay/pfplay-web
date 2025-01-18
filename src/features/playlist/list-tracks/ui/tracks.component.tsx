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
import { useQueryClient } from '@tanstack/react-query';
import { usePlaylistAction } from '@/entities/playlist';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { Playlist, PlaylistTrack } from '@/shared/api/http/types/playlists';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { PFDelete } from '@/shared/ui/icons';
import Track from './track.component';
import { useFetchPlaylistTracks } from '../api/use-fetch-playlist-tracks.query';

type TracksInPlaylistProps = {
  playlist: Playlist;
};

const TracksInPlaylist = ({ playlist }: TracksInPlaylistProps) => {
  const t = useI18n();
  const { data } = useFetchPlaylistTracks(playlist.id);
  const playlistAction = usePlaylistAction();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<PlaylistTrack[]>([]);

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

    if (oldIndex === undefined || newIndex === undefined) return;

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
      console.error('Failed to update track order:', error);
      if (data?.content) {
        setItems(data.content);
      }
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PlaylistTracks, playlist.id],
      });
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
          {items.map((track) => (
            <Track
              key={track.linkId}
              track={track}
              menuItems={[
                {
                  onClickItem: () => playlistAction.removeTrack(playlist.id, track.trackId),
                  label: t.playlist.btn.delete_playlist,
                  Icon: <PFDelete />,
                },
                // TODO: 구현되면 주석 해제
                // {
                //   onClickItem: () => alert('Not Implemented'),
                //   label: t.playlist.btn.move_playlist,
                //   Icon: <PFAddPlaylist />,
                // },
              ]}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TracksInPlaylist;
