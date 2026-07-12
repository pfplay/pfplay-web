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
  linkId: string;
  name: string;
  orderNumber: number;
  duration: string;
  thumbnailImage: string;
}

/**
 * 트랙 목록 조회 응답. 페이지네이션 봉투 + 재생 커서.
 * - lastPlayedTrackId: 재생 커서. CurrentDJ에겐 NOW(지금 재생 중) 트랙. 커서 미설정 시 null.
 *   NEXT(다음 재생 곡)는 이 커서 + 현재 트랙 순서로부터 클라이언트가 파생한다.
 */
export interface TracksOfPlaylistResponse extends PaginationResponse<PlaylistTrack> {
  lastPlayedTrackId: number | null;
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
export interface UpdatePlaylistRequestParams {
  name: string;
}

export interface RemoveTrackFromPlaylistRequestParams {
  playlistId: number;
  trackId: number;
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
  ) => Promise<void>;
  removePlaylist: (params: RemovePlaylistRequestBody) => Promise<void>;
  getTracksOfPlaylist: (
    playlistId: Playlist['id'],
    params?: GetTracksOfPlaylistParameters
  ) => Promise<TracksOfPlaylistResponse>;
  addTrackToPlaylist: (
    playlistId: Playlist['id'],
    params: AddTrackToPlaylistRequestBody
  ) => Promise<void>;
  removeTrackFromPlaylist: (params: RemoveTrackFromPlaylistRequestParams) => Promise<void>;
  changeTrackOrderInPlaylist: (request: ChangeTrackOrderRequest) => Promise<void>;
  moveTrackToPlaylist: (request: MoveTrackToPlaylistRequest) => Promise<void>;
}
