import {
  RegisterMeToQueuePayload,
  UnregisterMeFromQueuePayload,
  UnregisterDjFromQueuePayload,
  GetPlaybackHistoryPayload,
  PlaybackHistoryItem,
  SkipPlaybackPayload,
  DjsClient,
} from '@/shared/api/http/types/djs';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';

@Singleton
export default class DjsService extends HTTPClient implements DjsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public registerMeToQueue({ partyroomId, ...body }: RegisterMeToQueuePayload) {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/djs`, body);
  }

  public unregisterMeFromQueue({ partyroomId }: UnregisterMeFromQueuePayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/djs/me`);
  }

  public unregisterDjFromQueue({ partyroomId, djId }: UnregisterDjFromQueuePayload) {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/djs/${djId}`);
  }

  public getPlaybackHistories({ partyroomId }: GetPlaybackHistoryPayload) {
    return this.get<PlaybackHistoryItem[]>(`${this.ROUTE_V1}/${partyroomId}/playbacks/histories`);
  }

  public skipPlayback({ partyroomId }: SkipPlaybackPayload) {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/playback/skip`);
  }
}
