import { useMemo } from 'react';
import { getErrorMessage } from '@/shared/api/get-error-message';
import Dialog, { DialogProps } from './dialog.component';
import { useDialogContext } from './dialog.context';
import { Typography } from '../typography';

interface AlertDialogParams extends Pick<DialogProps, 'title' | 'Sub'> {
  content?: string;
  okText: string;
}
interface ConfirmDialogParams extends Pick<DialogProps, 'title' | 'Sub'> {
  content?: string;
  okText: string;
  cancelText: string;
}

export const useDialog = () => {
  const { openDialog, closeDialog } = useDialogContext();

  const predefinedDialogs = useMemo(
    () => ({
      openAlertDialog: async ({ title, Sub, content, okText }: AlertDialogParams) => {
        await openDialog((_, onCancel) => ({
          title,
          Sub,
          Body: () => (
            <>
              {content && <Typography type='body3'>{content}</Typography>}

              <Dialog.ButtonGroup>
                <Dialog.Button onClick={onCancel}>{okText}</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        }));
      },

      openConfirmDialog: async ({
        title,
        Sub,
        content,
        okText,
        cancelText,
      }: ConfirmDialogParams) => {
        return await openDialog<boolean>((onOk) => ({
          title,
          Sub,
          Body: () => (
            <>
              {content && <Typography type='body3'>{content}</Typography>}

              <Dialog.ButtonGroup>
                <Dialog.Button color='secondary' onClick={() => onOk(false)}>
                  {cancelText}
                </Dialog.Button>
                <Dialog.Button onClick={() => onOk(true)}>{okText}</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        }));
      },

      openErrorDialog: async (error: unknown) => {
        if (typeof window === 'undefined') {
          console.error(getErrorMessage(error));
          return;
        }

        await openDialog((_, onCancel) => ({
          title: { fullPhrase: 'Error', emphasisPhrase: 'Error' },
          Body: () => (
            <>
              <Typography type='body3'>{getErrorMessage(error)}</Typography>

              <Dialog.ButtonGroup>
                <Dialog.Button onClick={onCancel}>확인</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        }));
      },
    }),
    [openDialog]
  );

  return {
    openDialog,
    closeDialog,
    ...predefinedDialogs,
  };
};
