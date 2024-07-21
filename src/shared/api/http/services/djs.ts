import { Singleton } from '@/shared/lib/decorators/singleton';
import {
  RegisterMeToQueuePayload,
  UnregisterMeFromQueuePayload,
  UnregisterDjFromQueuePayload,
  CompletePlaybackPayload,
  SkipPlaybackPayload,
  DjsClient,
} from 'shared/api/http/types/djs';
import HTTPClient from '../client/client';

/**
 *   registerMeToQueue: (payload: RegisterMeToQueuePayload) => Promise<void>;
 *   unregisterMeFromQueue: (payload: UnregisterMeFromQueuePayload) => Promise<void>;
 *   unregisterDjFromQueue: (payload: UnregisterDjFromQueuePayload) => Promise<void>;
 *   completePlayback: (payload: CompletePlaybackPayload) => Promise<void>;
 *   skipPlayback: (payload: SkipPlaybackPayload) => Promise<void>;
 */

@Singleton
class DjsService extends HTTPClient implements DjsClient {
  private ROUTE_V1 = 'v1/partyrooms';

  public registerMeToQueue = ({ partyroomId, ...body }: RegisterMeToQueuePayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/djs`, body);
  };

  public unregisterMeFromQueue = ({ partyroomId }: UnregisterMeFromQueuePayload) => {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/djs/me`);
  };

  public unregisterDjFromQueue = ({ partyroomId, djId }: UnregisterDjFromQueuePayload) => {
    return this.delete<void>(`${this.ROUTE_V1}/${partyroomId}/djs/${djId}`);
  };

  public completePlayback = ({ partyroomId }: CompletePlaybackPayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/playback/complete`);
  };

  public skipPlayback = ({ partyroomId }: SkipPlaybackPayload) => {
    return this.post<void>(`${this.ROUTE_V1}/${partyroomId}/playback/skip`);
  };
}

const instance = new DjsService();
export default instance;
