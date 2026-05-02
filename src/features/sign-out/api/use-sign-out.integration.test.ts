vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/analytics', () => ({
  setUserId: vi.fn(),
}));

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { setUserId } from '@/shared/lib/analytics';
import { useStores } from '@/shared/lib/store/stores.context';
import useSignOut from './use-sign-out.mutation';

const mockMarkExitedOnBackend = vi.fn();
let locationHrefSetter: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  (useStores as Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ markExitedOnBackend: mockMarkExitedOnBackend }),
  });

  // location.href 할당을 가로채서 실제 navigation 방지
  locationHrefSetter = vi.fn();
  const originalLocation = window.location;
  Object.defineProperty(window, 'location', {
    value: {
      ...originalLocation,
      origin: originalLocation.origin,
      protocol: originalLocation.protocol,
      host: originalLocation.host,
      hostname: originalLocation.hostname,
      port: originalLocation.port,
      pathname: originalLocation.pathname,
      search: originalLocation.search,
      hash: originalLocation.hash,
    },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window.location, 'href', {
    set: locationHrefSetter,
    get: () => originalLocation.href,
    configurable: true,
  });
});

describe('useSignOut 통합', () => {
  test('성공 시 markExitedOnBackend를 호출한다', async () => {
    const { result } = renderWithClient(() => useSignOut());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockMarkExitedOnBackend).toHaveBeenCalledTimes(1);
  });

  test('성공 시 location.href를 /로 설정한다', async () => {
    const { result } = renderWithClient(() => useSignOut());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(locationHrefSetter).toHaveBeenCalledWith('/');
  });

  test('성공 시 setUserId(null)을 호출하고, location.href 이전에 호출한다 (분석 회귀 방지)', async () => {
    const { result } = renderWithClient(() => useSignOut());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setUserId).toHaveBeenCalledWith(null);
    // setUserId가 location.href setter보다 먼저 호출됐는지 확인
    const setUserIdOrder = (setUserId as Mock).mock.invocationCallOrder[0];
    const locationOrder = locationHrefSetter.mock.invocationCallOrder[0];
    expect(setUserIdOrder).toBeLessThan(locationOrder);
  });
});
