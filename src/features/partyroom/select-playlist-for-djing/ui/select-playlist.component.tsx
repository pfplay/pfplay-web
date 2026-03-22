import { useState } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { Typography } from '@/shared/ui/components/typography';
import { PFChevronRight, PFRadio, PFRadioOutline } from '@/shared/ui/icons';

type Props = {
  playlists: Playlist[];
  onSelect: (selected: Playlist) => void;
};

export default function SelectPlaylist({ playlists, onSelect }: Props) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();

  const handleSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    onSelect(playlist);
  };

  return (
    <div className='flexCol'>
      {playlists.map((playlist) => (
        <div
          key={'select-playlist' + playlist.id}
          role='button'
          tabIndex={0}
          className='flex gap-[8px] py-[16px] px-[12px] text-white first-of-type:border-t first-of-type:border-t-gray-600 border-b border-gray-600 cursor-pointer'
          onClick={() => handleSelect(playlist)}
        >
          {selectedPlaylist?.id === playlist.id ? (
            <PFRadio className='text-red-300' />
          ) : (
            <PFRadioOutline />
          )}

          <Typography type='detail1' overflow='ellipsis' className='flex-1'>
            {playlist.name}
          </Typography>

          <PFChevronRight />
        </div>
      ))}
    </div>
  );
}
