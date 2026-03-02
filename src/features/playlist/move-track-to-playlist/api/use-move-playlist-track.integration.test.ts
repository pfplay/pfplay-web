/**
 * @jest-environment <rootDir>/src/shared/api/__test__/jest-msw-env.ts
 */
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useRemovePlaylistTrack } from '@/features/playlist/remove-track/api/use-remove-playlist-track.mutation';
import { server } from '@/shared/api/__test__/msw-server';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import errorEmitter from '@/shared/api/http/error/error-emitter';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useMovePlaylistTrack } from './use-move-playlist-track.mutation';

describe('Playlist track operations integration (hook → service → MSW)', () => {
  describe('useMovePlaylistTrack', () => {
    it('resolves on success and invalidates both playlist track caches', async () => {
      const { result, queryClient } = renderWithClient(() => useMovePlaylistTrack());

      queryClient.setQueryData([QueryKeys.PlaylistTracks, 1], []);
      queryClient.setQueryData([QueryKeys.PlaylistTracks, 2], []);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ playlistId: 1, trackId: 10, targetPlaylistId: 2 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.PlaylistTracks, 1] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.PlaylistTracks, 2] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
      );
    });

    it('rejects with TRK-001 when track already exists in target', async () => {
      server.use(
        http.patch('http://localhost:8080/api/v1/playlists/:pid/tracks/:tid/move', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '재생목록에 이미 존재하는 음악',
                errorCode: 'TRK-001',
              },
            },
            { status: 400 }
          );
        })
      );

      const emitted: string[] = [];
      const unsub = errorEmitter.on('TRK-001' as any, () => emitted.push('TRK-001'));

      const { result } = renderWithClient(() => useMovePlaylistTrack());

      result.current.mutate({ playlistId: 1, trackId: 10, targetPlaylistId: 2 });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.response?.status).toBe(400);
      expect(emitted).toContain('TRK-001');

      unsub();
    });
  });

  describe('useRemovePlaylistTrack', () => {
    it('returns removed track IDs and invalidates caches', async () => {
      const { result, queryClient } = renderWithClient(() => useRemovePlaylistTrack());

      queryClient.setQueryData([QueryKeys.PlaylistTracks, 1], []);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ playlistId: 1, trackId: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ listIds: [10] });
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.PlaylistTracks, 1] })
      );
    });
  });
});
