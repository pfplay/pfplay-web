/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { waitFor } from '@testing-library/react';
import '@/shared/api/__test__/msw-server';
import useUnblockCrew from '@/features/partyroom/unblock-crew/api/use-unblock-crew.mutation';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import useBlockCrew from './use-block-crew.mutation';

describe('Crew block/unblock integration (hook → service → MSW)', () => {
  describe('useBlockCrew', () => {
    it('resolves on success and invalidates MyBlocks cache', async () => {
      const { result, queryClient } = renderWithClient(() => useBlockCrew());

      queryClient.setQueryData([QueryKeys.MyBlocks], []);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ crewId: 55 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.MyBlocks] })
      );
    });
  });

  describe('useUnblockCrew', () => {
    it('resolves on success and invalidates MyBlocks cache', async () => {
      const { result, queryClient } = renderWithClient(() => useUnblockCrew());

      queryClient.setQueryData([QueryKeys.MyBlocks], []);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ blockId: 1 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.MyBlocks] })
      );
    });
  });
});
