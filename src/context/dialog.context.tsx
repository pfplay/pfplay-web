import { createContext, useContext } from 'react';
import { DialogProps } from '@/components/shared/dialog.component';

export type DialogID = NonNullable<DialogProps['id']>;
type DialogFactory<T = void> = (
  onOk: (value: T) => void,
  onCancel?: () => void
) => Omit<DialogProps, 'open' | 'onClose' | 'id'>;

export type PushDialog = <T = void>(factory: DialogFactory<T>) => Promise<T | undefined>;
export type PopDialog = (id: DialogID) => Promise<void>;

export const DialogContext = createContext(
  {} as {
    openDialog: PushDialog;
    closeDialog: PopDialog;
  }
);

export const useDialogContext = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }

  return context;
};
