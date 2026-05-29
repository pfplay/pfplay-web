'use client';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SheetKey = 'select-playlist' | 'add-tracks' | 'djing-guide' | string;

export interface SheetEntry {
  key: SheetKey;
  node: ReactNode;
  title?: string;
  onClose?: () => void;
}

interface FullscreenSheetController {
  stack: SheetEntry[];
  push: (entry: SheetEntry) => void;
  pop: () => void;
  closeAll: () => void;
}

const FullscreenSheetContext = createContext<FullscreenSheetController | null>(null);

export const useFullscreenSheet = (): FullscreenSheetController => {
  const ctx = useContext(FullscreenSheetContext);
  if (!ctx) throw new Error('useFullscreenSheet must be used within FullscreenSheetProvider');
  return ctx;
};

export const FullscreenSheetProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<SheetEntry[]>([]);
  const stackRef = useRef<SheetEntry[]>([]);
  stackRef.current = stack;

  const push = useCallback((entry: SheetEntry) => {
    setStack((prev) => {
      // dedup: top entry with same key → ignore
      if (prev.length > 0 && prev[prev.length - 1].key === entry.key) return prev;
      window.history.pushState({ sheetKey: entry.key }, '');
      return [...prev, entry];
    });
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      top.onClose?.();
      return prev.slice(0, -1);
    });
  }, []);

  const closeAll = useCallback(() => {
    const current = stackRef.current;
    current.forEach((entry) => entry.onClose?.());
    if (current.length > 0) window.history.go(-current.length);
    setStack([]);
  }, []);

  useEffect(() => {
    const onPopstate = () => {
      if (stackRef.current.length === 0) return;
      pop();
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (stackRef.current.length === 0) return;
      window.history.back();
    };
    window.addEventListener('popstate', onPopstate);
    window.addEventListener('keydown', onKeydown);
    return () => {
      window.removeEventListener('popstate', onPopstate);
      window.removeEventListener('keydown', onKeydown);
    };
  }, [pop]);

  const value = useMemo<FullscreenSheetController>(
    () => ({ stack, push, pop, closeAll }),
    [stack, push, pop, closeAll]
  );

  return (
    <FullscreenSheetContext.Provider value={value}>{children}</FullscreenSheetContext.Provider>
  );
};
