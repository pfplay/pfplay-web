import { getErrorCode } from '@/shared/api/http/error/get-error-code';
import { ErrorCode, PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import { SkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
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
  AddTrackToPlaylistRequestBody,
  RemovePlaylistRequestBody,
  RemoveTrackFromPlaylistRequestParams,
  PlaylistsClient,
  ChangeTrackOrderRequest,
  MoveTrackToPlaylistRequest,
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

  @SkipGlobalErrorHandling({
    when: (error) =>
      [ErrorCode.NO_WALLET, ErrorCode.EXCEEDED_PLAYLIST_LIMIT].includes(
        getErrorCode(error) as ErrorCode
      ),
  })
  public createPlaylist(params: CreatePlaylistRequestBody) {
    return this.post<CreatePlaylistResponse>(`${this.ROUTE_V1}`, params);
  }

  public updatePlaylist(playlistId: Playlist['id'], params: UpdatePlaylistRequestParams) {
    return this.patch<void>(`${this.ROUTE_V1}/${playlistId}`, params);
  }

  public removePlaylist(params: RemovePlaylistRequestBody) {
    return this.delete<void>(`${this.ROUTE_V1}`, {
      data: params,
    });
  }

  public getTracksOfPlaylist(playlistId: Playlist['id'], params?: GetTracksOfPlaylistParameters) {
    return this.get<PaginationResponse<PlaylistTrack>>(`${this.ROUTE_V1}/${playlistId}/tracks`, {
      params,
    });
  }

  public addTrackToPlaylist(playlistId: Playlist['id'], params: AddTrackToPlaylistRequestBody) {
    return this.post<void>(`${this.ROUTE_V1}/${playlistId}/tracks`, params);
  }

  public removeTrackFromPlaylist({ playlistId, trackId }: RemoveTrackFromPlaylistRequestParams) {
    return this.delete<void>(`${this.ROUTE_V1}/${playlistId}/tracks/${trackId}`);
  }

  public changeTrackOrderInPlaylist({ playlistId, trackId, ...body }: ChangeTrackOrderRequest) {
    return this.put<void>(`${this.ROUTE_V1}/${playlistId}/tracks/${trackId}`, body);
  }

  @SkipGlobalErrorHandling({
    when: (error) =>
      [ErrorCode.DUPLICATE_TRACK_IN_PLAYLIST, ErrorCode.EXCEEDED_TRACK_LIMIT].includes(
        getErrorCode(error) as ErrorCode
      ),
  })
  public moveTrackToPlaylist({
    playlistId,
    trackId,
    targetPlaylistId,
  }: MoveTrackToPlaylistRequest) {
    return this.patch<void>(`${this.ROUTE_V1}/${playlistId}/tracks/${trackId}/move`, {
      targetPlaylistId,
    });
  }
}
