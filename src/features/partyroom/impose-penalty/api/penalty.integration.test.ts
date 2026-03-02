/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import '@/shared/api/__test__/msw-server';
import { act, waitFor } from '@testing-library/react';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import useImposePenaltyMutation from './use-impose-penalty.mutation';
import useLiftPenalty from '../../lift-penalty/api/use-lift-penalty.mutation';

describe('useImposePenaltyMutation 통합', () => {
  test('성공 시 Penalties 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useImposePenaltyMutation());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({
        partyroomId: 1,
        crewId: 10,
        penaltyType: 'MUTE' as any,
        detail: 'test',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.Penalties],
    });
  });
});

describe('useLiftPenalty 통합', () => {
  test('성공 시 Penalties 캐시를 무효화한다', async () => {
    const { result, queryClient } = renderWithClient(() => useLiftPenalty());
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      result.current.mutate({ partyroomId: 1, penaltyId: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QueryKeys.Penalties],
    });
  });
});
