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
  /**
   * 사용자가 시트를 닫았을 때(뒤로가기/×/Esc 경유 pop)만 발화 = "취소" 신호.
   * 소비자가 자체 결과를 처리한 뒤 호출하는 pop({ programmatic: true }) 에선 발화 안 함.
   * (이 구분이 없으면 confirm 후 programmatic pop 이 취소 콜백까지 발화시키는 footgun.)
   */
  onDismiss?: () => void;
}

interface FullscreenSheetController {
  stack: SheetEntry[];
  push: (entry: SheetEntry) => void;
  /** 기본(인자 없음) = user-driven dismiss → onDismiss 발화. programmatic=true → onDismiss skip. */
  pop: (opts?: { programmatic?: boolean }) => void;
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

  const pop = useCallback((opts?: { programmatic?: boolean }) => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      if (!opts?.programmatic) top.onDismiss?.();
      return prev.slice(0, -1);
    });
  }, []);

  const closeAll = useCallback(() => {
    // 강제 전체 닫힘(예: 라우트 이탈) = 미완 시트를 사용자가 떠난 것으로 간주 → dismiss 발화.
    const current = stackRef.current;
    current.forEach((entry) => entry.onDismiss?.());
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
