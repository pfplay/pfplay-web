'use client';

import { default as DialogPrimitive } from './dialog.component';
import open, { destroyAll } from './open';

export const Dialog = Object.assign(DialogPrimitive, {
  open,
  destroyAll,
});

export { useDialog } from './use-dialog.hook';
export { DialogProvider } from './dialog.provider';
export type { DialogTitleProps } from './dialog.component';
