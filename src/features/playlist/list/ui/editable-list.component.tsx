import React, { useState } from 'react';
import { useFetchPlaylists } from '@/features/playlist/list/api/use-fetch-playlist.query';
import { Playlist } from '@/shared/api/types/playlist';
import { Checkbox } from '@/shared/ui/components/checkbox';
import { Typography } from '@/shared/ui/components/typography';
import { PFEdit } from '@/shared/ui/icons';

type EditableListProps = {
  onEditItem?: (id: Playlist['id']) => void;
  onChangeSelectedItem?: (ids: Playlist['id'][]) => void;
};

const EditableList = ({ onEditItem, onChangeSelectedItem }: EditableListProps) => {
  const { data: playlists } = useFetchPlaylists();
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
    onChangeSelectedItem?.(newIds);
  };

  return (
    <div className='flex flex-col gap-3'>
      {playlists?.map((item) => (
        <div
          key={item.id}
          className='w-full flex gap-2 items-center px-4 py-3 rounded bg-gray-800 text-left text-gray-50 hover:bg-gray-700 '
        >
          <Checkbox
            checked={selectedIds.findIndex((x) => x === item.id) !== -1}
            onChange={() => handleChange(item.id)}
          />
          <Typography className='truncate flex-1'>{item.name}</Typography>

          <Typography className='text-gray-300'>{item.count}곡</Typography>
          <button onClick={() => onEditItem?.(item.id)}>
            <PFEdit />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditableList;
