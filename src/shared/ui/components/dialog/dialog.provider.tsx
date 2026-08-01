'use client';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { delay } from '@/shared/lib/functions/delay';
import Dialog, { DialogProps } from './dialog.component';
import { DialogContext, type DialogID, type PopDialog, type PushDialog } from './dialog.context';

type DialogOptions = Omit<DialogProps, 'id'> & {
  id: DialogID;
};

type DialogProviderProps = {
  children: ReactNode;
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
    // #488: 닫기와 DOM 제거 사이에는 창이 있고, 그 사이 Headless UI 는 포커스를
    // "열었던 요소"로 되돌린다. 사용자가 그 창에서 바깥 입력창을 클릭해 두었다면
    // 포커스를 빼앗겨 이후 타이핑이 사라진다 — 사용자의 클릭 의도를 지켜준다.
    const focusGuard = startUserFocusIntentGuard();
    await delay(CLOSE_TRANSITION_MS + CLOSE_TRANSITION_BUFFER_MS);

    setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));

    focusGuard.restore();
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

/** dialog.component 의 닫힘 전환(`leave ... duration-200`)과 맞춘다. */
const CLOSE_TRANSITION_MS = 200;
/** 전환이 끝난 직후 제거되도록 하는 여유분. 길수록 #488 의 포커스 탈취 창이 넓어진다. */
const CLOSE_TRANSITION_BUFFER_MS = 50;

/** 다이얼로그가 닫히는 동안 사용자가 포커스를 두려고 클릭한 요소를 기억한다. */
function startUserFocusIntentGuard() {
  const FOCUSABLE = 'input, textarea, select, [contenteditable="true"], [tabindex]';
  let intended: HTMLElement | null = null;

  const onPointerDown = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') return;
    if (target.closest('[role="dialog"]')) return;

    intended = target.closest(FOCUSABLE) as HTMLElement | null;
  };

  document.addEventListener('pointerdown', onPointerDown, true);

  return {
    restore() {
      document.removeEventListener('pointerdown', onPointerDown, true);
      if (!intended) return;

      // 라이브러리의 포커스 복원이 언제 도는지에 의존하지 않도록 짧은 구간에 걸쳐 확인한다
      const element = intended;
      const attempt = () => {
        if (!element.isConnected) return;
        if (document.activeElement !== element) element.focus();
      };
      [0, 50, 150].forEach((ms) => setTimeout(attempt, ms));
    },
  };
}
