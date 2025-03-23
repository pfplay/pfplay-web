import { Fragment, isValidElement } from 'react';

export function isFragment(child: unknown): boolean {
  return !!child && isValidElement(child) && child.type === Fragment;
}
