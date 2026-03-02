jest.mock('@/shared/lib/store/stores.context');
jest.mock('../api/use-fetch-my-blocked-crews.query');

import { renderHook } from '@testing-library/react';
import { useStores } from '@/shared/lib/store/stores.context';
import useIsBlockedCrew from './use-is-blocked-crew.hook';
import useFetchMyBlockedCrews from '../api/use-fetch-my-blocked-crews.query';

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useIsBlockedCrew hook', () => {
  test('차단된 crew에 대해 true를 반환한다', () => {
    (useFetchMyBlockedCrews as jest.Mock).mockReturnValue({
      data: [{ blockedCrewId: 10 }, { blockedCrewId: 20 }],
    });

    const { result } = renderHook(() => useIsBlockedCrew());
    expect(result.current(10)).toBe(true);
    expect(result.current(20)).toBe(true);
  });

  test('차단되지 않은 crew에 대해 false를 반환한다', () => {
    (useFetchMyBlockedCrews as jest.Mock).mockReturnValue({
      data: [{ blockedCrewId: 10 }],
    });

    const { result } = renderHook(() => useIsBlockedCrew());
    expect(result.current(99)).toBe(false);
  });

  test('partyroomId가 없으면 빈 Set을 사용한다', () => {
    (useStores as jest.Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: undefined }),
    });
    (useFetchMyBlockedCrews as jest.Mock).mockReturnValue({ data: [] });

    const { result } = renderHook(() => useIsBlockedCrew());
    expect(result.current(10)).toBe(false);
  });
});
