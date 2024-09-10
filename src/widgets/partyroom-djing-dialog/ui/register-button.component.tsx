import { useState } from 'react';
import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useFetchPlaylists } from '@/features/playlist/list';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useRegisterMeToQueue } from '../api/use-register-me-to-queue.mutation';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function RegisterButton() {
  const t = useI18n();
  const { data: playlists = [] } = useFetchPlaylists();
  const selectPlaylist = useSelectPlaylistForDjing({ playlists });
  const partyroomId = usePartyroomId();
  const { mutate: registerMeToQueue } = useRegisterMeToQueue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const registerMeToDjQueue = async () => {
    const playlist = await selectPlaylist();
    if (!playlist) return;

    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);

    if (selectedPlaylist) {
      registerMeToQueue({
        partyroomId,
        playlistId: selectedPlaylist.id,
      });
    }
  };

  const DjRulesModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>{t.dj.rules.title}</h2>
          <p>{t.dj.rules.description}</p>
          <Button onClick={onClose}>{t.dj.rules.confirm_button}</Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button size='lg' onClick={registerMeToDjQueue}>
        {t.dj.btn.register_queue}
      </Button>
      <DjRulesModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
}
