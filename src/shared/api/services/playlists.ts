import { pfpAxiosInstance } from '@/shared/api/clients/http/client';
import { PlaylistsClient } from '@/shared/api/types/playlists';

const ROUTE_V1 = 'v1/playlists';

export const PlaylistsService: PlaylistsClient = {
  getPlaylists: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}`);
  },
  getMusicFromPlaylist: (playlistId, params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/${playlistId}/musics`, { params });
  },
  getYoutubeMusics: (params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/music-search`, { params });
  },
  createPlaylist: (params) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}`, params);
  },
  updatePlaylist: (playlistId, params) => {
    return pfpAxiosInstance.patch(`${ROUTE_V1}/${playlistId}`, params);
  },
  addMusicToPlaylist: (playlistId, params) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/${playlistId}/musics`, params);
  },
  removePlaylist: (data) => {
    return pfpAxiosInstance.delete(`${ROUTE_V1}`, { data });
  },
  removeMusicFromPlaylist: ({ playlistId, ...data }) => {
    return pfpAxiosInstance.delete(`${ROUTE_V1}/${playlistId}/musics`, { data });
  },
};
