'use client';

import { createContext, useContext } from 'react';

/**
 * context 구현부에서 declaration-merging을 통해 인터페이스를 확장하여 사용해주세요.
 *
 * @see https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 *
 * @example
 * ```ts
 * declare module '@/shared/lib/store/stores.context' {
 *   interface Stores {
 *     useStoreA: ...;
 *     useStoreB: ...;
 *   }
 * }
 * ```
 */
export interface Stores {}

export const StoresContext = createContext<Stores | null>(null);

/**
 * zustand store가 RSC에서 오용되는걸 방지하기 위해 context로 제공.
 * @see https://github.com/pmndrs/zustand/discussions/2200
 */
export const useStores = () => {
  const context = useContext(StoresContext);

  if (!context) {
    throw new Error('useStore must be used within a StoreContext');
  }

  return context;
};
