import { PlaylistType } from '@/shared/api/types/@enums';

export interface Playlist {
  id: number;
  name: string;
  orderNumber: number;
  type: PlaylistType;
  musicCount: number;
}

export interface GetPlaylistsResponse {
  playlists: Playlist[];
}

export interface PlaylistMusicParameters {
  /**
   * @default 0
   */
  pageNo: number;
  /**
   * @default 20
   */
  pageSize: number;
}

export interface PlaylistMusic {
  musicId: number;
  ownerId: string;
  orderNumber: number;
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface PlaylistMusicResponse {
  musicList: PlaylistMusic[];
  totalPage: number;
  totalElements: number;
}

export interface YoutubeMusic {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  runningTime: string;
}

export interface YoutubeMusicsParameters {
  /**
   * TODO: 변경된 명세확인 필요
   * @see https://pfplay.slack.com/archives/C051N8A0ZSB/p1719248809282169
   */
  q: string;
  pageToken?: string;
}

export interface YoutubeMusicsResponse {
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
  linkId: string;
  name: string;
  duration: string;
  thumbnailImage: string;
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
  playlistId: number;
  listIds: number[];
}
export interface RemovePlaylistMusicResponse {
  listIds: number[];
}

export interface PlaylistsClient {
  getPlaylists: () => Promise<GetPlaylistsResponse>;
  getMusicFromPlaylist: (
    playlistId: Playlist['id'],
    params?: PlaylistMusicParameters
  ) => Promise<PlaylistMusicResponse>;
  getYoutubeMusics: (params: YoutubeMusicsParameters) => Promise<YoutubeMusicsResponse>;
  createPlaylist: (params: CreatePlaylistRequestBody) => Promise<CreatePlaylistResponse>;
  updatePlaylist: (
    playlistId: Playlist['id'],
    params: UpdatePlaylistRequestBody
  ) => Promise<UpdatePlaylistResponse>;
  addMusicToPlaylist: (
    playlistId: Playlist['id'],
    params: AddPlaylistMusicRequestBody
  ) => Promise<void>;
  removePlaylist: (params: RemovePlaylistRequestBody) => Promise<RemovePlaylistResponse>;
  removeMusicFromPlaylist: (
    params: RemovePlaylistMusicRequestBody
  ) => Promise<RemovePlaylistMusicResponse>;
}
