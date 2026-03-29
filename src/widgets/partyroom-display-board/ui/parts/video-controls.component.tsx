'use client';
import { useStores } from '@/shared/lib/store/stores.context';
import { PFFull, PFTheater } from '@/shared/ui/icons';
import VolumeControl from './volume-control.component';

type Props = {
  onTheater: () => void;
  onFull: () => void;
};

export default function VideoControls({ onTheater, onFull }: Props) {
  const { useUIState } = useStores();
  const cinemaView = useUIState((s) => s.cinemaView);

  return (
    <div className='absolute bottom-0 left-0 right-0 px-6 py-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
      <VolumeControl iconSize={20} />
      <div className='flex items-end gap-3'>
        {!cinemaView && (
          <button
            onClick={onTheater}
            className='flex items-center gap-2 bg-[#2f2f2f] h-9 px-4 rounded text-[#fdfdfd] text-sm cursor-pointer'
            title='Theater'
          >
            <PFTheater width={16} height={16} className='text-gray-50' />
            <span>Theater</span>
          </button>
        )}
        <button
          onClick={onFull}
          className='flex items-center gap-2 bg-[#2f2f2f] h-9 px-4 rounded text-[#fdfdfd] text-sm cursor-pointer'
          title='Full'
        >
          <PFFull width={16} height={16} className='text-gray-50' />
          <span>Full</span>
        </button>
      </div>
    </div>
  );
}
