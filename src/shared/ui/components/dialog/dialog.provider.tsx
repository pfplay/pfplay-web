'use client';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { delay } from '@/shared/lib/functions/delay';
import Dialog, { DialogProps } from './dialog.component';
import { DialogContext, type DialogID, type PopDialog, type PushDialog } from './dialog.context';

type DialogOptions = Omit<DialogProps, 'id'> & {
  id: DialogID;
};

type DialogProviderProps = {
  children: ReactElement;
};

export const DialogProvider = ({ children }: DialogProviderProps) => {
  const [dialogs, setDialogs] = useState<DialogOptions[]>([]);

  const pop: PopDialog = useCallback(async (id) => {
    // wait transition
    setDialogs((prevDialogs) =>
      prevDialogs.map((dialog) => {
        if (dialog.id !== id) return dialog;
        return { ...dialog, open: false };
      })
    );
    await delay(500);

    setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));
  }, []);

  const push: PushDialog = useCallback(
    (dialogFactory) => {
      return new Promise((resolve) => {
        const id = generateId();
        const onOk = (value: any) => {
          pop(id);
          resolve(value);
        };
        const onCancel = () => {
          pop(id);
          resolve(undefined);
        };

        const dialogOptions = dialogFactory(onOk, onCancel);
        const newDialog: DialogOptions = {
          id,
          open: true,
          onClose: onCancel,
          ...dialogOptions,
        };

        setDialogs((prevDialogs) => [...prevDialogs, newDialog]);
      });
    },
    [pop]
  );

  const contextValue = useMemo(
    () => ({
      openDialog: push,
      closeDialog: pop,
    }),
    [push, pop]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {dialogs.map(({ id, Body, ...rest }) => (
        <Dialog id={id} key={id} Body={Body} {...rest} />
      ))}
    </DialogContext.Provider>
  );
};

function generateId(): DialogID {
  return `${Date.now()}`;
}
