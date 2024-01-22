export interface Playlist {
  id: number;
  orderNumber: number;
  name: string;
  type: string;
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

export interface PlaylistClient {
  getPlaylist: () => Promise<Playlist[]>;
  getMusicFromPlaylist: (
    listId: number,
    params?: PlaylistMusicParameters
  ) => Promise<PlaylistMusicResponse>;
  getYoutubeMusic: (params: YoutubeMusicParameters) => Promise<YoutubeMusicResponse>;
  createPlaylist: (params: CreatePlaylistRequestBody) => Promise<CreatePlaylistResponse>;
  addMusicToPlaylist: (
    listId: number,
    params: AddPlaylistMusicRequestBody
  ) => Promise<AddPlaylistMusicResponse>;
}
