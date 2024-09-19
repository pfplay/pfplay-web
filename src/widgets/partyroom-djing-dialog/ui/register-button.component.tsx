import { useState, useEffect } from 'react';
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
  const [step, setStep] = useState(0); // 스텝 상태 관리
  const [hideModal, setHideModal] = useState(false); // 모달 숨기기 설정 관리

  // 로컬 스토리지에서 "다시 보지 않기" 설정 확인
  useEffect(() => {
    const hideModalSetting = localStorage.getItem('hideDjingRulesModal');
    if (hideModalSetting) {
      setHideModal(true);
    }
  }, []);

  const registerMeToDjQueue = async () => {
    const playlist = await selectPlaylist();
    if (!playlist) return;

    setSelectedPlaylist(playlist);

    // "다시 보지 않기" 설정이 되어있지 않으면 모달을 연다
    if (!hideModal) {
      setIsModalOpen(true);
    } else {
      registerMeToQueue({
        partyroomId,
        playlistId: playlist.id,
      });
    }
  };

  const handleNextStep = () => {
    if (step < 2) {
      setStep((prevStep) => prevStep + 1);
    } else {
      handleModalClose(); // 마지막 단계일 때 모달 닫기
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('hideDjingRulesModal', 'true'); // "다시 보지 않기" 설정 저장
    setHideModal(true);
    handleModalClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setStep(0); // 스텝 초기화

    if (selectedPlaylist) {
      registerMeToQueue({
        partyroomId,
        playlistId: selectedPlaylist.id,
      });
    }
  };

  const DjRulesModal = ({
    isOpen,
    onNext,
    onDontShowAgain,
  }: {
    isOpen: boolean;
    onNext: () => void;
    onDontShowAgain: () => void;
  }) => {
    if (!isOpen) return null;

    const modalContents = [
      { title: t.dj.rule.step1_title, content: t.dj.rule.step1_content },
      { title: t.dj.rule.step2_title, content: t.dj.rule.step2_content },
      { title: t.dj.rule.final_title, content: t.dj.rule.final_content },
    ];

    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <h2>{modalContents[step].title}</h2>
          <p>{modalContents[step].content}</p>
          <div className='modal-footer'>
            <Button onClick={onNext}>{step < 2 ? t.common.btn.next : t.common.btn.confirm}</Button>
            <Button onClick={onDontShowAgain}>{t.common.btn.dont_show_again}</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button size='lg' onClick={registerMeToDjQueue}>
        {t.dj.btn.register_queue}
      </Button>
      <DjRulesModal
        isOpen={isModalOpen}
        onNext={handleNextStep}
        onDontShowAgain={handleDontShowAgain}
      />
    </>
  );
}
