export interface PlaylistResponse {
  id: number;
  orderNumber: number;
  name: string;
  type: string;
}

export interface PlaylistMusicParameters {
  listId: string;
  page?: number; // default 0
  pageSize?: string; // default 20
}

export interface PlaylistMusicResponse {
  musicId: number;
  uid: string;
  orderNumber: number;
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface PlaylistYoutubeMusicList {
  id: string;
  thumbnailLow: string;
  thumbnailMedium: string;
  thumbnailHigh: string;
  title: string;
  duration: string;
}

export interface PlaylistYoutubeMusicParameters {
  q: string;
  pageToken?: string;
}

export interface PlaylistYoutubeMusicResponse {
  nextPageToken: string;
  musicList: PlaylistYoutubeMusicList[];
}

export interface CreatePlaylistRequestBody {
  name: string;
}

export interface CreatePlaylistResponse {
  id: number;
  name: string;
}

export interface AddPlaylistMusicRequestBody {
  uid: string;
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface AddPlaylistMusicPathParameters {
  listId: string;
}

export interface AddPlaylistMusicResponse {
  playListId: number;
  musicId: number;
  orderNumber: number;
  name: string;
  duration: string;
}

export interface PlaylistClient {
  getPlaylist: () => Promise<PlaylistResponse>;
  getPlaylistMusic: (params: PlaylistMusicParameters) => Promise<PlaylistMusicResponse>;
  getPlaylistYoutubeMusic: (
    params: PlaylistYoutubeMusicParameters
  ) => Promise<PlaylistYoutubeMusicResponse>;
  createPlaylist: (params: CreatePlaylistRequestBody) => Promise<CreatePlaylistResponse>;
  addPlaylistMusic: (
    params: AddPlaylistMusicPathParameters & AddPlaylistMusicRequestBody
  ) => Promise<AddPlaylistMusicResponse>;
}
