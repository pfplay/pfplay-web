import { PlaylistClient } from '../@types/Playlist';
import { pfpAxiosInstance } from '../client';
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
  // TODO: update api 연동 필요
  updatePlaylist: (params) => {
    return pfpAxiosInstance.put(`${ROUTE_V1}`, params);
  },
};
