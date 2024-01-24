import React, { useState } from 'react';
import { Playlist } from '@/api/@types/Playlist';
import { Checkbox } from '@/components/shared/Checkbox';
import Typography from '@/components/shared/atoms/Typography';
import { PFEdit } from '@/components/shared/icons';

type EditablePlaylistProps = {
  items?: Playlist[];
  onEditPlaylistName?: (id: number) => void;
  onChangeSelectedPlaylist?: (ids: number[]) => void;
};

const EditablePlaylist = ({
  items = [],
  onEditPlaylistName,
  onChangeSelectedPlaylist,
}: EditablePlaylistProps) => {
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
    onChangeSelectedPlaylist?.(newIds);
  };

  return (
    <div className='flex flex-col gap-3'>
      {items.map((item) => (
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
          <button onClick={() => onEditPlaylistName?.(item.id)}>
            <PFEdit />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditablePlaylist;
