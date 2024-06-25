import { PlaylistType } from '@/shared/api/types/@enums';
import { PaginationResponse } from '@/shared/api/types/@shared';

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

export interface GetPlaylistMusicsParameters {
  pageNumber: number;
  pageSize: number;
}

export interface PlaylistMusic {
  musicId: number;
  orderNumber: number;
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface SearchMusicsRequest {
  q: string;
  platform: 'youtube'; // 현재 플랫폼 하나만 있음
}

export interface SearchMusicsResponse {
  musicList: MusicListItem[];
}

export interface MusicListItem {
  videoId: string;
  videoTitle: string;
  thumbnailUrl: string;
  runningTime: string;
}

export interface CreatePlaylistRequestBody {
  name: string;
}

export interface CreatePlaylistResponse {
  id: number;
  orderNumber: number;
  name: string;
  type: PlaylistType;
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
  getMusicsFromPlaylist: (
    playlistId: Playlist['id'],
    params?: GetPlaylistMusicsParameters
  ) => Promise<PaginationResponse<PlaylistMusic>>;
  searchMusics: (params: SearchMusicsRequest) => Promise<SearchMusicsResponse>;
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
  removeMusicsFromPlaylist: (
    params: RemovePlaylistMusicRequestBody
  ) => Promise<RemovePlaylistMusicResponse>;
}
