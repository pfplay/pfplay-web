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
  const t = useI18n();

  const modalContents = [
    {
      title: t.dj.title.rule_guide,
      content: (
        <>
          {t.dj.title.rule_guide} <span style={{ color: 'red' }}>{t.dj.title.rule_guide}</span>
          <br />
          <span style={{ color: 'red' }}>{t.dj.title.rule_guide}</span> {t.dj.title.rule_guide}
        </>
      ),
      image: 'https://img1.newsis.com/2021/04/26/NISI20210426_0000733879_web.jpg',
    },
    {
      title: t.dj.title.rule_guide,
      content: (
        <>
          {t.dj.title.rule_guide}
          <br />
          <span style={{ color: 'red' }}>{t.dj.title.rule_guide}</span>
        </>
      ),
      image: 'https://img1.newsis.com/2021/04/26/NISI20210426_0000733879_web.jpg',
    },
    {
      title: t.dj.title.rule_guide,
      content: (
        <>
          {t.dj.title.rule_guide}
          <br />
          <span style={{ color: 'red' }}>{t.dj.title.rule_guide}</span>
        </>
      ),
      image: 'https://img1.newsis.com/2021/04/26/NISI20210426_0000733879_web.jpg',
    },
  ];

  const [step, setStep] = useState(0);

  const handleNextStep = () => {
    if (step < modalContents.length - 1) {
      setStep(step + 1);
    } else {
      props.onCancel?.();
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(LocalStorageKeys.HIDE_DJING_RULES_MODAL, 'true');
    props.onCancel?.();
  };

  const modalBodyStyle = {
    whiteSpace: 'pre-line',
    marginTop: '20px',
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2 className='modal-title'>{modalContents[step].title}</h2>

        <img
          src={modalContents[step].image}
          alt={`Step ${step + 1}`}
          style={{
            width: '100%',
            height: 'auto',
            marginBottom: '20px',
            borderRadius: '8px',
          }}
        />

        <p className='modal-body' style={modalBodyStyle}>
          {modalContents[step].content}
        </p>

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
              {index + 1}
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
