import { PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';
import type {
  GetPlaylistsResponse,
  GetTracksOfPlaylistParameters,
  PlaylistTrack,
  SearchMusicsRequest,
  SearchMusicsResponse,
  CreatePlaylistRequestBody,
  CreatePlaylistResponse,
  Playlist,
  UpdatePlaylistRequestParams,
  UpdatePlaylistResponse,
  AddTrackToPlaylistRequestBody,
  RemovePlaylistRequestBody,
  RemovePlaylistResponse,
  RemoveTrackFromPlaylistRequestParams,
  RemoveTrackFromPlaylistResponse,
  PlaylistsClient,
  MoveTrackInPlaylistRequest,
} from '../types/playlists';

@Singleton
export default class PlaylistsService extends HTTPClient implements PlaylistsClient {
  private ROUTE_V1 = 'v1/playlists';

  public searchMusics(params: SearchMusicsRequest) {
    return this.get<SearchMusicsResponse>(`v1/music-search`, { params });
  }

  public getPlaylists() {
    return this.get<GetPlaylistsResponse>(`${this.ROUTE_V1}`);
  }

  public createPlaylist(params: CreatePlaylistRequestBody) {
    return this.post<CreatePlaylistResponse>(`${this.ROUTE_V1}`, params);
  }

  public updatePlaylist(playlistId: Playlist['id'], params: UpdatePlaylistRequestParams) {
    return this.patch<UpdatePlaylistResponse>(`${this.ROUTE_V1}/${playlistId}`, params);
  }

  public removePlaylist(params: RemovePlaylistRequestBody) {
    return this.delete<RemovePlaylistResponse>(`${this.ROUTE_V1}`, {
      data: params,
    });
  }

  public getTracksOfPlaylist(playlistId: Playlist['id'], params?: GetTracksOfPlaylistParameters) {
    return this.get<PaginationResponse<PlaylistTrack>>(`${this.ROUTE_V1}/${playlistId}/musics`, {
      params,
    });
  }

  public addTrackToPlaylist(playlistId: Playlist['id'], params: AddTrackToPlaylistRequestBody) {
    return this.post<void>(`${this.ROUTE_V1}/${playlistId}/musics`, params);
  }

  public removeTrackFromPlaylist({ playlistId, trackId }: RemoveTrackFromPlaylistRequestParams) {
    return this.delete<RemoveTrackFromPlaylistResponse>(
      `${this.ROUTE_V1}/${playlistId}/musics/${trackId}`
    );
  }

  public moveTrackOrderInPlaylist({ playlistId, trackId, ...body }: MoveTrackInPlaylistRequest) {
    return this.put<void>(`${this.ROUTE_V1}/${playlistId}/musics/${trackId}`, body);
  }
}
