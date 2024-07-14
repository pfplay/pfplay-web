import { PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import { pfpAxiosInstance } from '../client/client';
import {
  GetPlaylistsResponse,
  GetPlaylistMusicsParameters,
  PlaylistMusic,
  SearchMusicsRequest,
  SearchMusicsResponse,
  CreatePlaylistRequestBody,
  CreatePlaylistResponse,
  Playlist,
  UpdatePlaylistRequestBody,
  UpdatePlaylistResponse,
  AddPlaylistMusicRequestBody,
  RemovePlaylistRequestBody,
  RemovePlaylistResponse,
  RemovePlaylistMusicRequestBody,
  RemovePlaylistMusicResponse,
  PlaylistsClient,
} from '../types/playlists';

@Singleton
class PlaylistsService implements PlaylistsClient {
  private ROUTE_V1 = 'v1/playlists';

  public getPlaylists() {
    return pfpAxiosInstance.get<unknown, GetPlaylistsResponse>(`${this.ROUTE_V1}`);
  }

  public getMusicsFromPlaylist(playlistId: Playlist['id'], params?: GetPlaylistMusicsParameters) {
    return pfpAxiosInstance.get<unknown, PaginationResponse<PlaylistMusic>>(
      `${this.ROUTE_V1}/${playlistId}/musics`,
      { params }
    );
  }

  public searchMusics(params: SearchMusicsRequest) {
    return pfpAxiosInstance.get<unknown, SearchMusicsResponse>(`v1/music-search`, { params });
  }

  public createPlaylist(params: CreatePlaylistRequestBody) {
    return pfpAxiosInstance.post<unknown, CreatePlaylistResponse>(`${this.ROUTE_V1}`, params);
  }

  public updatePlaylist(playlistId: Playlist['id'], params: UpdatePlaylistRequestBody) {
    return pfpAxiosInstance.patch<unknown, UpdatePlaylistResponse>(
      `${this.ROUTE_V1}/${playlistId}`,
      params
    );
  }

  public addMusicToPlaylist(playlistId: Playlist['id'], params: AddPlaylistMusicRequestBody) {
    return pfpAxiosInstance.post<unknown, void>(`${this.ROUTE_V1}/${playlistId}/musics`, params);
  }

  public removePlaylist(params: RemovePlaylistRequestBody) {
    return pfpAxiosInstance.delete<unknown, RemovePlaylistResponse>(`${this.ROUTE_V1}`, {
      data: params,
    });
  }

  public removeMusicsFromPlaylist(params: RemovePlaylistMusicRequestBody) {
    const { playlistId, ...data } = params;
    return pfpAxiosInstance.delete<unknown, RemovePlaylistMusicResponse>(
      `${this.ROUTE_V1}/${playlistId}/musics`,
      { data }
    );
  }
}

const instance = new PlaylistsService();
export default instance;
