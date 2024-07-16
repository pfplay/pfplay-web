import { PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';
import type {
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
class PlaylistsService extends HTTPClient implements PlaylistsClient {
  private ROUTE_V1 = 'v1/playlists';

  public getPlaylists = () => {
    return this.get<GetPlaylistsResponse>(`${this.ROUTE_V1}`);
  };

  public getMusicsFromPlaylist = (
    playlistId: Playlist['id'],
    params?: GetPlaylistMusicsParameters
  ) => {
    return this.get<PaginationResponse<PlaylistMusic>>(`${this.ROUTE_V1}/${playlistId}/musics`, {
      params,
    });
  };

  public searchMusics = (params: SearchMusicsRequest) => {
    return this.get<SearchMusicsResponse>(`v1/music-search`, { params });
  };

  public createPlaylist = (params: CreatePlaylistRequestBody) => {
    return this.post<CreatePlaylistResponse>(`${this.ROUTE_V1}`, params);
  };

  public updatePlaylist = (playlistId: Playlist['id'], params: UpdatePlaylistRequestBody) => {
    return this.patch<UpdatePlaylistResponse>(`${this.ROUTE_V1}/${playlistId}`, params);
  };

  public addMusicToPlaylist = (playlistId: Playlist['id'], params: AddPlaylistMusicRequestBody) => {
    return this.post<void>(`${this.ROUTE_V1}/${playlistId}/musics`, params);
  };

  public removePlaylist = (params: RemovePlaylistRequestBody) => {
    return this.delete<RemovePlaylistResponse>(`${this.ROUTE_V1}`, {
      data: params,
    });
  };

  public removeMusicsFromPlaylist = (params: RemovePlaylistMusicRequestBody) => {
    const { playlistId, ...data } = params;
    return this.delete<RemovePlaylistMusicResponse>(`${this.ROUTE_V1}/${playlistId}/musics`, {
      data,
    });
  };
}

const instance = new PlaylistsService();
export default instance;
