import { useState } from 'react';
import { usePlaylistAction } from '@/entities/playlist';
import { PlaylistType } from '@/shared/api/http/types/@enums';
import { Playlist } from '@/shared/api/http/types/playlists';
import { cn } from '@/shared/lib/functions/cn';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';

type EditableListProps = {
  onChangeSelectedItem: (ids: Playlist['id'][]) => void;
};

export default function EditableList({ onChangeSelectedItem }: EditableListProps) {
  const t = useI18n();
  const playlistAction = usePlaylistAction();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleChange = (id: number) => {
    const newIds = [...selectedIds];

    if (newIds.length > 0) {
      const index = newIds.findIndex((x) => x === id);

      if (index === -1) {
        newIds.push(id);
      } else {
        newIds.splice(index, 1);
      }
    } else {
      newIds.push(id);
    }

    setSelectedIds(newIds);
    onChangeSelectedItem(newIds);
  };

  return (
    <div className='flex flex-col gap-3'>
      {playlistAction.list.map((item) => {
        const disabled = isGrabPlaylist(item);

        return (
          <div
            key={item.id}
            className={cn(
              'w-full flex gap-2 items-center px-4 py-3 rounded bg-gray-800 text-left text-gray-50',
              {
                'hover:bg-gray-700': !disabled,
                'cursor-not-allowed': disabled,
              }
            )}
          >
            <Checkbox
              checked={selectedIds.findIndex((x) => x === item.id) !== -1}
              onChange={() => handleChange(item.id)}
              disabled={disabled}
            />
            <Typography className='truncate flex-1'>{item.name}</Typography>

            <Typography className='text-gray-300'>
              {item.musicCount}
              {t.playlist.title.song}
            </Typography>

            <TextButton
              color={disabled ? 'secondary' : 'primary'}
              Icon={<PFEdit />}
              onClick={() => playlistAction.edit(item.id)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}

function isGrabPlaylist(playlist: Playlist) {
  return playlist.type === PlaylistType.GRABLIST;
}
