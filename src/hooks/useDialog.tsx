import { useContext, useMemo } from 'react';
import { getErrorMessage } from '@/api/helper';
import Dialog, { DialogProps } from '@/components/shared/Dialog';
import Typography from '@/components/shared/atoms/Typography';
import { DialogContext } from '@/context/DialogProvider';

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
  const { openDialog, closeDialog } = useContext(DialogContext);
  if (!openDialog) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

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
                <Dialog.Button onClick={() => onOk(false)}>{cancelText}</Dialog.Button>
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
