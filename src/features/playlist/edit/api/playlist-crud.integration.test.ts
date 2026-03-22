import { waitFor } from '@testing-library/react';
import '@/shared/api/__test__/msw-server';
import { useAddPlaylistTrack } from '@/features/playlist/add-tracks/api/use-add-playlist-track.mutation';
import { useFetchPlaylistTracks } from '@/features/playlist/list-tracks/api/use-fetch-playlist-tracks.query';
import { useRemovePlaylist } from '@/features/playlist/remove/api/use-remove-playlist.mutation';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { useUpdatePlaylist } from './use-update-playlist.mutation';

describe('Playlist CRUD integration (hook → service → MSW)', () => {
  describe('useUpdatePlaylist', () => {
    it('returns updated data and invalidates Playlist cache', async () => {
      const { result, queryClient } = renderWithClient(() => useUpdatePlaylist());

      queryClient.setQueryData([QueryKeys.Playlist], { playlists: [] });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({ listId: 1, name: 'Renamed' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual('');
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
      );
    });
  });

  describe('useRemovePlaylist', () => {
    it('returns removed IDs and invalidates Playlist cache', async () => {
      const { result, queryClient } = renderWithClient(() => useRemovePlaylist());

      queryClient.setQueryData([QueryKeys.Playlist], { playlists: [] });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate([1, 2]);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual('');
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
      );
    });
  });

  describe('useAddPlaylistTrack', () => {
    it('resolves and invalidates PlaylistTracks + Playlist caches', async () => {
      const { result, queryClient } = renderWithClient(() => useAddPlaylistTrack());

      queryClient.setQueryData([QueryKeys.PlaylistTracks, 5], []);
      queryClient.setQueryData([QueryKeys.Playlist], { playlists: [] });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        listId: 5,
        linkId: 'abc123',
        name: 'Test Track',
        duration: '03:30',
        thumbnailImage: 'https://example.com/thumb.jpg',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.PlaylistTracks, 5] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: [QueryKeys.Playlist] })
      );
    });
  });

  describe('useFetchPlaylistTracks', () => {
    it('returns paginated track data', async () => {
      const { result } = renderWithClient(() => useFetchPlaylistTracks(1));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.content).toHaveLength(2);
      expect(result.current.data?.content[0]).toMatchObject({
        trackId: 10,
        name: 'Track A',
      });
      expect(result.current.data?.pagination).toMatchObject({
        totalElements: 2,
        hasNext: false,
      });
    });
  });
});
