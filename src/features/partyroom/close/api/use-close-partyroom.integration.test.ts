/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/entities/current-partyroom', () => ({
  useRemoveCurrentPartyroomCaches: () => mockRemoveCaches,
}));

const mockRemoveCaches = jest.fn();

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { useStores } from '@/shared/lib/store/stores.context';
import useClosePartyroom from './use-close-partyroom.mutation';

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useClosePartyroom 통합', () => {
  test('성공 시 removeCurrentPartyroomCaches를 호출한다', async () => {
    const { result } = renderWithClient(() => useClosePartyroom());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRemoveCaches).toHaveBeenCalledTimes(1);
  });

  test('partyroomId가 없으면 에러를 던진다', async () => {
    (useStores as jest.Mock).mockReturnValue({
      useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: undefined }),
    });

    const { result } = renderWithClient(() => useClosePartyroom());

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('partyroomId');
  });
});
