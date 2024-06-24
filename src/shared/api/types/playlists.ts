export interface Playlist {
  id: number;
  orderNumber: number;
  name: string;
  type: string; // FIXME: change to enum
  count: number;
}

export interface PlaylistMusicParameters {
  page?: number; // default 0
  pageSize?: number; // default 20
}

export interface PlaylistMusic {
  musicId: number;
  uid: string;
  orderNumber: number;
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface PlaylistMusicResponse {
  musicList: PlaylistMusic[];
  totalPage: number;
}

export interface YoutubeMusic {
  id: string;
  thumbnailLow: string;
  thumbnailMedium: string;
  thumbnailHigh: string;
  title: string;
  duration: string;
}

export interface YoutubeMusicParameters {
  q: string;
  pageToken?: string;
}

export interface YoutubeMusicResponse {
  nextPageToken: string;
  musicList: YoutubeMusic[];
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

export interface AddPlaylistMusicResponse {
  playListId: number;
  musicId: number;
  orderNumber: number;
  name: string;
  duration: string;
}

export interface RemovePlaylistRequestBody {
  listIds: number[];
}
export interface RemovePlaylistResponse {
  listIds: number[];
}

export interface UpdatePlaylistRequestBody {
  name: string;
}

export interface UpdatePlaylistResponse {
  id: number;
  name: string;
}

export interface RemovePlaylistMusicRequestBody {
  listIds: number[];
}
export interface RemovePlaylistMusicResponse {
  listIds: number[];
}

export interface PlaylistsClient {
  getPlaylists: () => Promise<Playlist[]>;
  getMusicFromPlaylist: (
    listId: number,
    params?: PlaylistMusicParameters
  ) => Promise<PlaylistMusicResponse>;
  getYoutubeMusic: (params: YoutubeMusicParameters) => Promise<YoutubeMusicResponse>;
  createPlaylist: (params: CreatePlaylistRequestBody) => Promise<CreatePlaylistResponse>;
  updatePlaylist: (
    listId: number,
    params: UpdatePlaylistRequestBody
  ) => Promise<UpdatePlaylistResponse>;
  removePlaylist: (params: RemovePlaylistRequestBody) => Promise<RemovePlaylistResponse>;
  addMusicToPlaylist: (
    listId: number,
    params: AddPlaylistMusicRequestBody
  ) => Promise<AddPlaylistMusicResponse>;
  removeMusicFromPlaylist: (
    params: RemovePlaylistMusicRequestBody
  ) => Promise<RemovePlaylistMusicResponse>;
}
