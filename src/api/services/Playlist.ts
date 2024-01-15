import { PlaylistClient } from '../@types/Playlist';
import { pfpAxiosInstance } from '../client';
const ROUTE_V1 = 'v1/play-list';

export const PlaylistService: PlaylistClient = {
  getPlaylist: () => {
    return pfpAxiosInstance.get(`${ROUTE_V1}`);
  },
  getPlaylistMusic: ({ listId, ...params }) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/${listId}`, { params });
  },
  getPlaylistYoutubeMusic: (params) => {
    return pfpAxiosInstance.get(`${ROUTE_V1}/youtube/music`, { params });
  },
  addPlaylistMusic: ({ listId, ...params }) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}/${listId}`, params);
  },
  createPlaylist: (params) => {
    return pfpAxiosInstance.post(`${ROUTE_V1}`, params);
  },
};
