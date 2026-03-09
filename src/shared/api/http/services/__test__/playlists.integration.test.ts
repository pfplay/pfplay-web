import { http, HttpResponse } from 'msw';
import { server } from '@/shared/api/__test__/msw-server';
import { playlistsService } from '@/shared/api/http/services';

describe('PlaylistsService integration (axios → interceptors → MSW)', () => {
  describe('createPlaylist', () => {
    it('returns unwrapped response on success', async () => {
      const result = await playlistsService.createPlaylist({ name: 'New Playlist' });

      expect(result).toEqual({
        id: 1,
        orderNumber: 1,
        name: 'New Playlist',
        type: 'PLAYLIST',
      });
    });
  });

  describe('getPlaylists', () => {
    it('returns unwrapped playlist list', async () => {
      const result = await playlistsService.getPlaylists();

      expect(result.playlists).toHaveLength(2);
      expect(result.playlists[0]).toMatchObject({ id: 1, name: 'My Playlist' });
    });
  });

  describe('searchMusics', () => {
    it('returns unwrapped search results', async () => {
      const result = await playlistsService.searchMusics({ q: 'test', platform: 'youtube' });

      expect(result.musicList).toHaveLength(2);
      expect(result.musicList[0].videoTitle).toBe('test - Result 1');
    });
  });

  describe('addTrackToPlaylist', () => {
    it('resolves without throwing on success', async () => {
      await playlistsService.addTrackToPlaylist(1, {
        linkId: 'abc123',
        name: 'Test Track',
        duration: 'PT3M30S',
        thumbnailImage: 'https://example.com/thumb.jpg',
      });
      // void endpoint — just verifying the full pipeline doesn't throw
    });
  });

  describe('API error (400)', () => {
    it('rejects with AxiosError containing errorCode', async () => {
      server.use(
        http.post('http://localhost:8080/api/v1/playlists', () => {
          return HttpResponse.json(
            {
              data: {
                status: 'BAD_REQUEST',
                code: 400,
                message: '재생목록 개수 제한을 초과함',
                errorCode: 'PLL-002',
              },
            },
            { status: 400 }
          );
        })
      );

      try {
        await playlistsService.createPlaylist({ name: 'Fail' });
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response.status).toBe(400);
        expect(e.response.data.errorCode).toBe('PLL-002');
      }
    });
  });

  describe('Network error', () => {
    it('rejects with AxiosError on network failure', async () => {
      server.use(
        http.get('http://localhost:8080/api/v1/playlists', () => {
          return HttpResponse.error();
        })
      );

      try {
        await playlistsService.getPlaylists();
        fail('Expected error to be thrown');
      } catch (e: any) {
        expect(e.isAxiosError).toBe(true);
        expect(e.response).toBeUndefined();
      }
    });
  });
});
