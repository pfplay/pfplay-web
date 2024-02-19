import { PlaylistClient } from '@/api/@types/Playlist';
import { pfpAxiosInstance } from '@/api/clients/http/client';

const ROUTE_V1 = 'v1/play-list';

export const PlaylistService: PlaylistClient = {
  getPlaylist: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}`);
  },
  getMusicFromPlaylist: (listId, params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/${listId}`, { params });
  },
  getYoutubeMusic: (params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/youtube/music`, { params });
  },
  addMusicToPlaylist: (listId, params) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/${listId}`, params);
  },
  createPlaylist: (params) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}`, params);
  },
  updatePlaylist: (listId, params) => {
    return pfpAxiosInstance.patch(`${ROUTE_V1}/${listId}`, params);
  },
  deletePlaylist: (data) => {
    return pfpAxiosInstance.delete(`${ROUTE_V1}`, { data });
  },
  deleteMusicFromPlaylist: (data) => {
    return pfpAxiosInstance.delete(`${ROUTE_V1}/music`, { data });
  },
};
