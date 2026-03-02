import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

export const handlers = [
  // ──────────────────────────────────────────────
  // Playlists
  // ──────────────────────────────────────────────

  // POST /v1/playlists — createPlaylist
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

  // GET /v1/playlists — getPlaylists
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

  // PATCH /v1/playlists/:id — updatePlaylist
  http.patch(`${BASE_URL}/v1/playlists/:id`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      data: { id: 1, name: body.name },
    });
  }),

  // DELETE /v1/playlists — removePlaylist
  http.delete(`${BASE_URL}/v1/playlists`, async ({ request }) => {
    const body = (await request.json()) as { playlistIds: number[] };
    return HttpResponse.json({
      data: { playlistIds: body.playlistIds },
    });
  }),

  // POST /v1/playlists/:id/tracks — addTrackToPlaylist (void)
  http.post(`${BASE_URL}/v1/playlists/:id/tracks`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/playlists/:playlistId/tracks/:trackId — removeTrackFromPlaylist
  http.delete(`${BASE_URL}/v1/playlists/:playlistId/tracks/:trackId`, ({ params }) => {
    return HttpResponse.json({
      data: { listIds: [Number(params.trackId)] },
    });
  }),

  // PATCH /v1/playlists/:playlistId/tracks/:trackId/move — moveTrackToPlaylist
  http.patch(`${BASE_URL}/v1/playlists/:playlistId/tracks/:trackId/move`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // PUT /v1/playlists/:playlistId/tracks/:trackId — changeTrackOrderInPlaylist
  http.put(`${BASE_URL}/v1/playlists/:playlistId/tracks/:trackId`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/playlists/:id/tracks — getTracksOfPlaylist
  http.get(`${BASE_URL}/v1/playlists/:id/tracks`, () => {
    return HttpResponse.json({
      data: {
        content: [
          {
            trackId: 10,
            linkId: 100,
            name: 'Track A',
            orderNumber: 1,
            duration: '03:30',
            thumbnailImage: 'https://example.com/a.jpg',
          },
          {
            trackId: 20,
            linkId: 200,
            name: 'Track B',
            orderNumber: 2,
            duration: '04:15',
            thumbnailImage: 'https://example.com/b.jpg',
          },
        ],
        pagination: {
          pageNumber: 0,
          pageSize: 100,
          totalPages: 1,
          totalElements: 2,
          hasNext: false,
        },
      },
    });
  }),

  // GET /v1/music-search — searchMusics
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

  // ──────────────────────────────────────────────
  // Users
  // ──────────────────────────────────────────────

  // GET /v1/users/me/info — getMyInfo
  http.get(`${BASE_URL}/v1/users/me/info`, () => {
    return HttpResponse.json({
      data: {
        uid: 'user-123',
        email: 'test@pfplay.io',
        authorityTier: 'FM',
        registrationDate: '2024-06-23',
        profileUpdated: true,
      },
    });
  }),

  // GET /v1/users/me/profile/summary — getMyProfileSummary
  http.get(`${BASE_URL}/v1/users/me/profile/summary`, () => {
    return HttpResponse.json({
      data: {
        nickname: 'TestUser',
        introduction: 'Hello',
        avatarBodyUri: 'https://example.com/body.png',
        avatarFaceUri: 'https://example.com/face.png',
        avatarIconUri: 'https://example.com/icon.png',
        walletAddress: '0x1234',
        activitySummaries: [{ activityType: 'DJ_PNT', score: 100 }],
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
    });
  }),

  // ──────────────────────────────────────────────
  // Partyrooms
  // ──────────────────────────────────────────────

  // POST /v1/partyrooms — create
  http.post(`${BASE_URL}/v1/partyrooms`, () => {
    return HttpResponse.json({
      data: { partyroomId: 42 },
    });
  }),

  // GET /v1/partyrooms — getList
  http.get(`${BASE_URL}/v1/partyrooms`, () => {
    return HttpResponse.json({
      data: [
        {
          partyroomId: 1,
          stageType: 'MAIN',
          title: 'Main Stage',
          introduction: 'Welcome',
          crewCount: 5,
          playbackActivated: true,
          playback: { name: 'Song A', thumbnailImage: 'https://example.com/song.jpg' },
          primaryIcons: [{ avatarIconUri: 'https://example.com/icon.png' }],
        },
      ],
    });
  }),

  // POST /v1/partyrooms/:id/enter — enter
  http.post(`${BASE_URL}/v1/partyrooms/:id/enter`, () => {
    return HttpResponse.json({
      data: { crewId: 99, gradeType: 'CLUBBER' },
    });
  }),

  // POST /v1/partyrooms/:id/exit — exit
  http.post(`${BASE_URL}/v1/partyrooms/:id/exit`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // PATCH /v1/partyrooms/:id/crews/:crewId/grade — adjustGrade
  http.patch(`${BASE_URL}/v1/partyrooms/:id/crews/:crewId/grade`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/partyrooms/:id/summary — getPartyroomDetailSummary
  http.get(`${BASE_URL}/v1/partyrooms/:id/summary`, () => {
    return HttpResponse.json({
      data: {
        title: 'Main Stage',
        introduction: 'Welcome to the party',
        linkDomain: 'main-stage',
        playbackTimeLimit: 300,
        currentDj: { crewId: 1, nickname: 'DJ Test', avatarIconUri: 'https://example.com/dj.png' },
      },
    });
  }),

  // ──────────────────────────────────────────────
  // Crews
  // ──────────────────────────────────────────────

  // GET /v1/crews/me/blocks — getBlockedCrews
  http.get(`${BASE_URL}/v1/crews/me/blocks`, () => {
    return HttpResponse.json({
      data: [
        {
          blockId: 1,
          blockedCrewId: 55,
          nickname: 'BlockedUser',
          avatarIconUri: 'https://example.com/blocked.png',
        },
      ],
    });
  }),

  // POST /v1/crews/me/blocks — blockCrew
  http.post(`${BASE_URL}/v1/crews/me/blocks`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/crews/me/blocks/:blockId — unblockCrew
  http.delete(`${BASE_URL}/v1/crews/me/blocks/:blockId`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // ──────────────────────────────────────────────
  // DJs
  // ──────────────────────────────────────────────

  // POST /v1/partyrooms/:id/djs — registerMeToQueue
  http.post(`${BASE_URL}/v1/partyrooms/:id/djs`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/partyrooms/:id/djs/me — unregisterMeFromQueue
  http.delete(`${BASE_URL}/v1/partyrooms/:id/djs/me`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/partyrooms/:id/dj-queue — getDjingQueue
  http.get(`${BASE_URL}/v1/partyrooms/:id/dj-queue`, () => {
    return HttpResponse.json({
      data: {
        playbackActivated: true,
        queueStatus: 'OPEN',
        isRegistered: false,
        djs: [
          {
            crewId: 1,
            orderNumber: 1,
            nickname: 'DJ One',
            avatarIconUri: 'https://example.com/dj1.png',
          },
          {
            crewId: 2,
            orderNumber: 2,
            nickname: 'DJ Two',
            avatarIconUri: 'https://example.com/dj2.png',
          },
        ],
      },
    });
  }),

  // GET /v1/partyrooms/:id/playbacks/histories — getPlaybackHistories
  http.get(`${BASE_URL}/v1/partyrooms/:id/playbacks/histories`, () => {
    return HttpResponse.json({
      data: [
        { musicName: 'Song A', nickname: 'DJ One', avatarIconUri: 'https://example.com/dj1.png' },
        { musicName: 'Song B', nickname: 'DJ Two', avatarIconUri: 'https://example.com/dj2.png' },
      ],
    });
  }),

  // PUT /v1/partyrooms/:id — edit
  http.put(`${BASE_URL}/v1/partyrooms/:id`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/partyrooms/:id — close
  http.delete(`${BASE_URL}/v1/partyrooms/:id`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // PUT /v1/partyrooms/:id/dj-queue — changeDjQueueStatus
  http.put(`${BASE_URL}/v1/partyrooms/:id/dj-queue`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/partyrooms/:id/dj-queue/:djId — deleteDjFromQueue
  http.delete(`${BASE_URL}/v1/partyrooms/:id/dj-queue/:djId`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/partyrooms/:id/playback/skip — skipPlayback
  http.post(`${BASE_URL}/v1/partyrooms/:id/playback/skip`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/partyrooms/:id/playbacks/reaction — reaction
  http.post(`${BASE_URL}/v1/partyrooms/:id/playbacks/reaction`, () => {
    return HttpResponse.json({
      data: { isLiked: true, isDisliked: false, isGrabbed: false },
    });
  }),

  // ──────────────────────────────────────────────
  // Penalties
  // ──────────────────────────────────────────────

  // POST /v1/partyrooms/:id/penalties — imposePenalty
  http.post(`${BASE_URL}/v1/partyrooms/:id/penalties`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // DELETE /v1/partyrooms/:id/penalties/:penaltyId — liftPenalty
  http.delete(`${BASE_URL}/v1/partyrooms/:id/penalties/:penaltyId`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/partyrooms/:id/penalties — getPenaltyList
  http.get(`${BASE_URL}/v1/partyrooms/:id/penalties`, () => {
    return HttpResponse.json({
      data: [
        {
          penaltyId: 1,
          penaltyType: 'MUTE',
          crewId: 10,
          nickname: 'User1',
          avatarIconUri: 'https://example.com/u1.png',
        },
      ],
    });
  }),

  // ──────────────────────────────────────────────
  // Users (Profile)
  // ──────────────────────────────────────────────

  // PUT /v1/users/me/profile/bio — updateMyBio
  http.put(`${BASE_URL}/v1/users/me/profile/bio`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // PUT /v1/users/me/profile/avatar — updateMyAvatar
  http.put(`${BASE_URL}/v1/users/me/profile/avatar`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/users/me/profile/avatar/bodies — getMyAvatarBodies
  http.get(`${BASE_URL}/v1/users/me/profile/avatar/bodies`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'Body A',
          resourceUri: 'https://example.com/bodyA.png',
          available: true,
          combinable: true,
          defaultSetting: false,
        },
        {
          id: 2,
          name: 'Body B',
          resourceUri: 'https://example.com/bodyB.png',
          available: true,
          combinable: false,
          defaultSetting: true,
        },
      ],
    });
  }),

  // GET /v1/users/me/profile/avatar/faces — getMyAvatarFaces
  http.get(`${BASE_URL}/v1/users/me/profile/avatar/faces`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'Face A', resourceUri: 'https://example.com/faceA.png', available: true },
      ],
    });
  }),

  // PUT /v1/users/me/profile/wallet — updateMyWallet
  http.put(`${BASE_URL}/v1/users/me/profile/wallet`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // ──────────────────────────────────────────────
  // Auth
  // ──────────────────────────────────────────────

  // POST /v1/users/guests/sign — signInGuest
  http.post(`${BASE_URL}/v1/users/guests/sign`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/auth/logout — signOut
  http.post(`${BASE_URL}/v1/auth/logout`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
];
