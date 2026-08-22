import { useState } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import useCanChangeNotice from '../api/use-can-change-notice.hook';
import useChangeNoticeMutation from '../api/use-change-notice.mutation';

export const NOTICE_MAX_LENGTH = 50;

export default function useChangeNotice() {
  const t = useI18n();
  const { mutate } = useChangeNoticeMutation();
  const { openConfirmDialog } = useDialog();
  const canChangeNotice = useCanChangeNotice();
  const openChangeNoticeDialog = useOpenChangeNoticeDialog();

  return async () => {
    if (!canChangeNotice) {
      await openConfirmDialog({ title: t.ed.para.edit_only_admin });
      return;
    }

    const content = await openChangeNoticeDialog();
    if (content === undefined) return;

    mutate(content);
  };
}

function useOpenChangeNoticeDialog() {
  const t = useI18n();
  const { openDialog } = useDialog();

  return () => {
    return openDialog<string>((onOk, onCancel) => ({
      title: t.ed.btn.regi_notice,
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          {t.ed.para.noti_deleted}
        </Typography>
      ),
      Body: () => {
        const [content, setContent] = useState('');
        const trimmed = content.trim();
        const overLimit = content.length > NOTICE_MAX_LENGTH;

        const submit = () => {
          if (overLimit) return;
          onOk(trimmed);
        };

        return (
          <>
            <Input
              autoFocus
              value={content}
              maxLength={NOTICE_MAX_LENGTH}
              placeholder={t.common.ec.char_up_to_50}
              onChange={(e) => setContent(e.target.value)}
              onPressEnter={submit}
              data-testid='change-notice-input'
            />

            <Dialog.ButtonGroup>
              <Dialog.Button
                color='secondary'
                onClick={onCancel}
                data-testid='change-notice-cancel-button'
              >
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button
                disabled={overLimit}
                onClick={submit}
                data-testid='change-notice-confirm-button'
              >
                {t.common.btn.confirm}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };
}
