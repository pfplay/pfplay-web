/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/shared/lib/store/stores.context');

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useStores } from '@/shared/lib/store/stores.context';
import useSignOut from './use-sign-out.mutation';

const mockMarkExitedOnBackend = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({ markExitedOnBackend: mockMarkExitedOnBackend }),
  });
  // location.href 할당 방지
  Object.defineProperty(window, 'location', {
    value: { href: '/' },
    writable: true,
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
    expect(window.location.href).toBe('/');
  });
});
