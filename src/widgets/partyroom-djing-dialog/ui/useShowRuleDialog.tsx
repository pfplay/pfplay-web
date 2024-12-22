import { useState } from 'react';
import { Playlist } from '@/shared/api/http/types/playlists';
import { LocalStorageKeys } from '@/shared/config/local-storage-keys';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';

export default function useShowDjingRuleDialog() {
  const { openDialog } = useDialog();

  return () => {
    return openDialog<Playlist>((_, onCancel) => {
      return {
        Body: <Body onCancel={onCancel} />,
        closeWhenOverlayClicked: false,
      };
    });
  };
}

type Props = {
  onCancel?: () => void;
};

function Body(props: Props) {
  // 모달 내용 상수로 분리
  const modalContents = [
    {
      title: '디제잉 규칙 안내',
      content: (
        <>
          대기중인 DJ <span style={{ color: 'red' }}>한명씩</span>
          <br />
          <span style={{ color: 'red' }}>순서대로</span> 음악을 디제잉 합니다
        </>
      ),
    },
    {
      title: '디제잉 규칙 안내',
      content: (
        <>
          플레이리스트의 가장 상단에 있는 곡부터
          <br />
          <span style={{ color: 'red' }}>순차적으로 한명당 하나씩 플레이</span> 됩니다
        </>
      ),
    },
    {
      title: '디제잉 규칙 안내',
      content: (
        <>
          노래가 끝나면 디제잉 동안 받은
          <br />
          <span style={{ color: 'red' }}>좋아요, 그랩, 싫어요를 카운팅</span>해 보여드립니다
        </>
      ),
    },
  ];

  const [step, setStep] = useState(0);
  const t = useI18n();

  // "다음" 버튼 클릭 시의 동작
  const handleNextStep = () => {
    if (step < modalContents.length - 1) {
      setStep(step + 1); // 스텝 증가
    } else {
      props.onCancel?.(); // 마지막 스텝이면 모달 닫기
    }
  };

  // "다시 보지 않기" 버튼 클릭 시의 동작
  const handleDontShowAgain = () => {
    localStorage.setItem(LocalStorageKeys.HIDE_DJING_RULES_MODAL, 'true');
    props.onCancel?.();
  };

  const modalBodyStyle = {
    whiteSpace: 'pre-line', // 개행과 공백을 유지
    marginTop: '20px', //TODO: DJ대기열
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2 className='modal-title'>{modalContents[step].title}</h2>
        <p className='modal-body' style={modalBodyStyle}>
          {modalContents[step].content}
        </p>

        {/* Stepper */}
        <div
          className='step-indicator'
          style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
        >
          {modalContents.map((_, index) => (
            <span
              key={index}
              className={`step-number ${index === step ? 'active' : ''}`}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: index === step ? 'red' : '#ddd',
                color: index === step ? 'white' : 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 5px',
                opacity: 0.5,
              }}
            >
              {index + 1} {/* 스텝 번호 표시 */}
            </span>
          ))}
        </div>

        <div className='modal-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextButton
            onClick={handleDontShowAgain}
            className='dont-show-again-btn'
            style={{ opacity: 0.4 }}
          >
            {t.common.btn.dont_show_again}
          </TextButton>
          <Button onClick={handleNextStep} className='next-btn'>
            {step < modalContents.length - 1 ? t.common.btn.next : t.common.btn.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
