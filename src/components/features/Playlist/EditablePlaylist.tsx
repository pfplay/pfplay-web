import React from 'react';
import { Playlist } from '@/api/@types/Playlist';

type EditablePlaylistProps = {
  items?: Playlist[];
};

const EditablePlaylist = ({ items = [] }: EditablePlaylistProps) => {
  return (
    <div>
      {items.map((item) => (
        <div className='w-full flexRow justify-between items-center px-4 py-3 rounded bg-gray-800 text-left text-gray-50 hover:bg-gray-700 '>
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default EditablePlaylist;
