import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const handlers = [
  // POST /api/v1/playlists — createPlaylist
  http.post(`${BASE_URL}/v1/playlists`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      data: {
        id: 1,
        orderNumber: 1,
        name: body.name,
        type: 'PLAYLIST',
      },
    });
  }),

  // GET /api/v1/playlists — getPlaylists
  http.get(`${BASE_URL}/v1/playlists`, () => {
    return HttpResponse.json({
      data: {
        playlists: [
          { id: 1, name: 'My Playlist', orderNumber: 1, type: 'PLAYLIST', musicCount: 3 },
          { id: 2, name: 'Grablist', orderNumber: 2, type: 'GRABLIST', musicCount: 0 },
        ],
      },
    });
  }),

  // PATCH /api/v1/playlists/:id — updatePlaylist
  http.patch(`${BASE_URL}/v1/playlists/:id`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      data: { id: 1, name: body.name },
    });
  }),

  // DELETE /api/v1/playlists — removePlaylist
  http.delete(`${BASE_URL}/v1/playlists`, async ({ request }) => {
    const body = (await request.json()) as { playlistIds: number[] };
    return HttpResponse.json({
      data: { playlistIds: body.playlistIds },
    });
  }),

  // POST /api/v1/playlists/:id/tracks — addTrackToPlaylist (void response)
  http.post(`${BASE_URL}/v1/playlists/:id/tracks`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /api/v1/music-search — searchMusics
  http.get(`${BASE_URL}/v1/music-search`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    return HttpResponse.json({
      data: {
        musicList: [
          {
            videoId: 'abc123',
            videoTitle: `${q} - Result 1`,
            thumbnailUrl: 'https://img.youtube.com/vi/abc123/0.jpg',
            runningTime: 'PT3M30S',
          },
          {
            videoId: 'def456',
            videoTitle: `${q} - Result 2`,
            thumbnailUrl: 'https://img.youtube.com/vi/def456/0.jpg',
            runningTime: 'PT4M15S',
          },
        ],
      },
    });
  }),
];
