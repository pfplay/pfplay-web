import { PlaylistType } from './@enums';
import { PaginationResponse } from './@shared';

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

export interface GetTracksOfPlaylistParameters {
  pageNumber: number;
  pageSize: number;
}

/**
 * 사용자가 지정한 Music 객체가 특정한 플레이리스트에 종속되는 순간 Track 객체가 됩니다.
 */
export interface PlaylistTrack {
  trackId: number;
  linkId: number;
  name: string;
  orderNumber: number;
  duration: string;
  thumbnailImage: string;
}

export interface SearchMusicsRequest {
  q: string;
  platform: 'youtube'; // 현재 플랫폼 하나만 있음
}

export interface SearchMusicsResponse {
  musicList: Music[];
}

/**
 * - Youtube 뮤직
 * - Spotify 뮤직
 * - Melon 뮤직
 * 모두 가능한 추상 객체입니다. Playlist에 종속되면 "Track"이 됩니다.
 */
export interface Music {
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

export interface AddTrackToPlaylistRequestBody {
  linkId: string; // = videoId
  name: string;
  duration: string;
  thumbnailImage: string;
}

export interface RemovePlaylistRequestBody {
  playlistIds: number[];
}
export interface RemovePlaylistResponse {
  playlistIds: number[];
}

export interface UpdatePlaylistRequestParams {
  name: string;
}

export interface UpdatePlaylistResponse {
  id: number;
  name: string;
}

export interface RemoveTrackFromPlaylistRequestParams {
  playlistId: number;
  trackId: number;
}
export interface RemoveTrackFromPlaylistResponse {
  listIds: number[];
}

export type ChangeTrackOrderRequest = {
  playlistId: number;
  trackId: number;
  nextOrderNumber: number;
};

export interface MoveTrackToPlaylistRequest {
  playlistId: number;
  trackId: number;
  targetPlaylistId: number;
}

export interface PlaylistsClient {
  searchMusics: (params: SearchMusicsRequest) => Promise<SearchMusicsResponse>;
  getPlaylists: () => Promise<GetPlaylistsResponse>;
  createPlaylist: (params: CreatePlaylistRequestBody) => Promise<CreatePlaylistResponse>;
  updatePlaylist: (
    playlistId: Playlist['id'],
    params: UpdatePlaylistRequestParams
  ) => Promise<UpdatePlaylistResponse>;
  removePlaylist: (params: RemovePlaylistRequestBody) => Promise<RemovePlaylistResponse>;
  getTracksOfPlaylist: (
    playlistId: Playlist['id'],
    params?: GetTracksOfPlaylistParameters
  ) => Promise<PaginationResponse<PlaylistTrack>>;
  addTrackToPlaylist: (
    playlistId: Playlist['id'],
    params: AddTrackToPlaylistRequestBody
  ) => Promise<void>;
  removeTrackFromPlaylist: (
    params: RemoveTrackFromPlaylistRequestParams
  ) => Promise<RemoveTrackFromPlaylistResponse>;
  changeTrackOrderInPlaylist: (request: ChangeTrackOrderRequest) => Promise<void>;
  moveTrackToPlaylist: (request: MoveTrackToPlaylistRequest) => Promise<void>;
}
