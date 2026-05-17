import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockEnter = vi.fn();
const mockTeardown = vi.fn();
const mockReplace = vi.fn();
let searchParamsValue: string | null = null;

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' }),
  useSearchParams: () => ({ get: (_: string) => searchParamsValue }),
  useRouter: () => ({ replace: mockReplace }),
}));

vi.mock('@/features/partyroom/enter', () => ({
  useEnterPartyroom: () => mockEnter,
}));

vi.mock('@/features/partyroom/exit', () => ({
  useTeardownPartyroom: () => mockTeardown,
}));

vi.mock('@/shared/lib/analytics/room-tracking', () => ({
  parseEntrySource: (s: string | null) => s,
}));

import PartyroomLayout from './layout';

beforeEach(() => {
  vi.clearAllMocks();
  searchParamsValue = null;
});

describe('PartyroomLayout (Cluster A PR-4 L2: unmount=teardown, no unload backend-exit)', () => {
  test('마운트 시 enter() 를 호출한다', () => {
    render(
      <PartyroomLayout>
        <div>child</div>
      </PartyroomLayout>
    );

    expect(mockEnter).toHaveBeenCalledTimes(1);
  });

  test('?source= 가 있으면 router.replace 로 즉시 제거한다', () => {
    searchParamsValue = 'invite';

    render(
      <PartyroomLayout>
        <div>child</div>
      </PartyroomLayout>
    );

    expect(mockReplace).toHaveBeenCalledWith('/parties/7', { scroll: false });
  });

  test('언마운트 시 teardown(클라 정리)만 호출한다 (백엔드 exit 훅 자체를 더 이상 참조하지 않음)', () => {
    const { unmount } = render(
      <PartyroomLayout>
        <div>child</div>
      </PartyroomLayout>
    );

    unmount();

    expect(mockTeardown).toHaveBeenCalledTimes(1);
  });

  test('beforeunload / pagehide 리스너를 등록하지 않는다', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    const { unmount } = render(
      <PartyroomLayout>
        <div>child</div>
      </PartyroomLayout>
    );
    unmount();

    const events = addSpy.mock.calls.map(([type]) => type);
    expect(events).not.toContain('beforeunload');
    expect(events).not.toContain('pagehide');

    addSpy.mockRestore();
  });
});
