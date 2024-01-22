'use client';
import { createContext, FC, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import Dialog, { DialogProps } from '@/components/shared/Dialog';
import { delay } from '@/utils/delay';

type DialogFactory<T = void> = (
  onOk: (value: T) => void,
  onCancel?: () => void
) => Omit<DialogProps, 'open' | 'onClose' | 'id'>;
type PushDialog = <T = void>(factory: DialogFactory<T>) => Promise<T | undefined>;

type ID = NonNullable<DialogProps['id']>;
type PopDialog = (id: ID) => Promise<void>;

interface DialogOptions extends Omit<DialogProps, 'id'> {
  id: ID;
}

export const DialogContext = createContext(
  {} as {
    openDialog: PushDialog;
    closeDialog: PopDialog;
  }
);

const generateId = () => `${Date.now()}`;

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
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
