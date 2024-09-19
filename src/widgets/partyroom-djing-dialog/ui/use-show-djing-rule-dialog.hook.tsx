import { useState } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { LocalStorageKeys } from '@/shared/config/local-storage-keys';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';

export default function useShowDjingRuleDialog() {
  const { openDialog } = useDialog();

  return () => {
    return openDialog<Playlist>((_, onCancel) => ({
      title: '디제잉 규칙 안내',
      Body: () => {
        const t = useI18n();
        const [step, setStep] = useState(0); // 스텝 상태 관리

        const handleNextStep = () => {
          if (step < 2) {
            setStep((prevStep) => prevStep + 1);
          } else {
            onCancel?.(); // 마지막 단계일 때 모달 닫기
          }
        };

        const handleDontShowAgain = () => {
          localStorage.setItem(LocalStorageKeys.HIDE_DJING_RULES_MODAL, 'true'); // "다시 보지 않기" 설정 저장
          onCancel?.();
        };

        const modalContents = [
          { title: 'step1 title', content: 'step1 content' },
          { title: 'step2 title', content: 'step2 content' },
          { title: 'step3 title', content: 'step3 content' },
        ];

        return (
          <div className='modal-overlay'>
            <div className='modal-content'>
              <h2>{modalContents[step].title}</h2>
              <p>{modalContents[step].content}</p>
              <div className='modal-footer'>
                <Button onClick={handleNextStep}>
                  {step < 2 ? t.common.btn.next : t.common.btn.confirm}
                </Button>
                <Button onClick={handleDontShowAgain}>{t.common.btn.dont_show_again}</Button>
              </div>
            </div>
          </div>
        );
      },
      closeWhenOverlayClicked: false, // true가 되면, 드로워가 열리고 overlay를 클릭하여 닫았을때 drawer를 다시는 닫을 수 없게됩니다.
    }));
  };
}
