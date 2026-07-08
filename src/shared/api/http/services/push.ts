import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';
import type { PushSubscribeRequest, PushUnsubscribeRequest } from '../types/push';

@Singleton
export default class PushService extends HTTPClient {
  private ROUTE_V1 = 'v1/push/subscriptions';

  public subscribe(req: PushSubscribeRequest) {
    return this.post<{ subscriptionId: number }>(this.ROUTE_V1, req);
  }

  public unsubscribe(req: PushUnsubscribeRequest) {
    return this.delete<void>(this.ROUTE_V1, { data: req });
  }
}
