/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
jest.mock('@/shared/lib/store/stores.context');

import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useStores } from '@/shared/lib/store/stores.context';
import useEditPartyroom from './use-edit-partyroom.mutation';

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) => selector({ id: 1 }),
  });
});

describe('useEditPartyroom 통합', () => {
  test('성공 시 PartyroomDetailSummary 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useEditPartyroom());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({
        title: 'New Title',
        introduction: 'New Intro',
        playbackTimeLimit: 300,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.PartyroomDetailSummary, 1],
    });
  });
});
