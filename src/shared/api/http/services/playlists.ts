import { pfpAxiosInstance } from '../client/client';
import { PlaylistsClient } from '../types/playlists';

const ROUTE_V1 = 'v1/playlists';

export const PlaylistsService: PlaylistsClient = {
  getPlaylists: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}`);
  },
  getMusicsFromPlaylist: (playlistId, params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/${playlistId}/musics`, { params });
  },
  searchMusics: (params) => {
    return pfpAxiosInstance.get(`v1/music-search`, { params });
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
  removeMusicsFromPlaylist: ({ playlistId, ...data }) => {
    return pfpAxiosInstance.delete(`${ROUTE_V1}/${playlistId}/musics`, { data });
  },
};
