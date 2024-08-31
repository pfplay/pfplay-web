import React from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog, Dialog } from '@/shared/ui/components/dialog';
import { TextButton } from '@/shared/ui/components/text-button';
import { useSkipPlayback } from '../api/use-skip-playback.mutation';
import { usePartyroomId } from '../lib/partyroom-id.context';

export default function SkipPlaybackButton() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const { mutate: skipPlayback } = useSkipPlayback();
  const partyroomId = usePartyroomId();

  const handleSkipClick = async () => {
    const confirmed = await openDialog<boolean>((onOk, onCancel) => ({
      title: 'Do you want to skip the current track?', // TODO: dictionary에 추가 후 I18n으로 변경
      titleType: 'body1',
      Body: () => {
        return (
          <Dialog.ButtonGroup>
            <Dialog.Button color='secondary' onClick={onCancel}>
              {t.common.btn.cancel}
            </Dialog.Button>
            <Dialog.Button onClick={() => onOk(true)}>{t.common.btn.confirm}</Dialog.Button>
          </Dialog.ButtonGroup>
        );
      },
    }));

    if (confirmed) {
      skipPlayback({ partyroomId });
    }
  };

  return (
    <TextButton onClick={handleSkipClick} className='text-gray-50 px-3' typographyType='caption1'>
      {t.common.btn.skip}
    </TextButton>
  );
}
