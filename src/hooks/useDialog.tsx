import React, { useMemo } from 'react';
import { getErrorMessage } from '@/api/helper';
import Typography from '@/components/@shared/@atoms/Typography';
import Dialog, { DialogProps } from '@/components/@shared/Dialog';
import { DialogContext } from '@/context/DialogProvider';

interface AlertDialogParams extends Pick<DialogProps, 'title' | 'subTitle'> {
  content?: string;
  okText: string;
}
interface ConfirmDialogParams extends Pick<DialogProps, 'title' | 'subTitle'> {
  content?: string;
  okText: string;
  cancelText: string;
}

export const useDialog = () => {
  const { openDialog, closeDialog } = React.useContext(DialogContext);
  if (!openDialog) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

  const predefinedDialogs = useMemo(
    () => ({
      openAlertDialog: ({ title, subTitle, content, okText }: AlertDialogParams) =>
        openDialog((_, onCancel) => ({
          title,
          subTitle,
          Body: () => (
            <>
              {content && <Typography type='body3'>{content}</Typography>}

              <Dialog.ButtonGroup>
                <Dialog.Button onClick={onCancel}>{okText}</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        })),

      openConfirmDialog: ({ title, subTitle, content, okText, cancelText }: ConfirmDialogParams) =>
        openDialog<boolean>((onOk) => ({
          title,
          subTitle,
          Body: () => (
            <>
              {content && <Typography type='body3'>{content}</Typography>}

              <Dialog.ButtonGroup>
                <Dialog.Button onClick={() => onOk(false)}>{cancelText}</Dialog.Button>
                <Dialog.Button onClick={() => onOk(true)}>{okText}</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        })),

      openErrorDialog: (error: unknown) =>
        openDialog((_, onCancel) => ({
          title: { fullPhrase: 'Error', emphasisPhrase: 'Error' },
          Body: () => (
            <>
              <Typography type='body3'>{getErrorMessage(error)}</Typography>

              <Dialog.ButtonGroup>
                <Dialog.Button onClick={onCancel}>확인</Dialog.Button>
              </Dialog.ButtonGroup>
            </>
          ),
        })),
    }),
    [openDialog]
  );

  return {
    openDialog,
    closeDialog,
    ...predefinedDialogs,
  };
};