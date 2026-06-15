import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileDjingGuide from './use-mobile-djing-guide.hook';

const setDjingGuideHiddenMock = vi.fn();
const djingGuideHiddenMock = vi.fn();

vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: (
    selector?: (s: {
      djingGuideHidden: boolean;
      setDjingGuideHidden: (h: boolean) => void;
    }) => unknown
  ) => {
    const state = {
      djingGuideHidden: djingGuideHiddenMock(),
      setDjingGuideHidden: setDjingGuideHiddenMock,
    };
    return selector ? selector(state) : state;
  },
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        guide_title: 'DJ 규칙',
      },
    },
  }),
}));

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileDjingGuide', () => {
  test('djingGuideHidden=true → showDjingGuide=false', () => {
    djingGuideHiddenMock.mockReturnValue(true);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    expect(result.current.showDjingGuide).toBe(false);
  });

  test('djingGuideHidden=false → showDjingGuide=true', () => {
    djingGuideHiddenMock.mockReturnValue(false);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    expect(result.current.showDjingGuide).toBe(true);
  });

  test('openDjingGuideModal 호출 시 sheet push (오류 없이 실행)', () => {
    djingGuideHiddenMock.mockReturnValue(false);
    const { result } = renderHook(() => useMobileDjingGuide(), { wrapper: wrap });
    act(() => result.current.openDjingGuideModal());
    // sheet 가 stack 에 push 됨 — 통합 테스트(Phase 9) 에서 sheet 안 GuideLayout 동작 검증.
    // 본 hook test 는 contract 만.
  });
});
