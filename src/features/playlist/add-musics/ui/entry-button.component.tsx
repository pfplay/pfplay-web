import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFAdd, PFClose } from '@/shared/ui/icons';
import YoutubeMusicSearch from './youtube-music-search.component';

const EntryButton = () => {
  const { openDialog } = useDialog();

  const handleAddMusic = () => {
    openDialog((_, onClose) => ({
      classNames: {
        container: '!p-[unset] w-[800px] bg-black border border-gray-700',
      },
      Body: (
        <YoutubeMusicSearch
          extraAction={
            <button onClick={onClose}>
              <PFClose width={24} height={24} />
            </button>
          }
        />
      ),
      hideDim: true,
    }));
  };

  return (
    <Button size='sm' variant='outline' color='secondary' Icon={<PFAdd />} onClick={handleAddMusic}>
      곡 추가
    </Button>
  );
};

export default EntryButton;
