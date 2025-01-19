import {
  BlockCrewPayload,
  UnblockCrewPayload,
  CrewsClient,
  BlockedCrew,
} from '@/shared/api/http/types/crews';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';

@Singleton
export default class CrewsService extends HTTPClient implements CrewsClient {
  private ROUTE_V1 = 'v1/crews';

  public getBlockedCrews() {
    return this.get<BlockedCrew[]>(`${this.ROUTE_V1}/me/blocks`);
  }

  public blockCrew(payload: BlockCrewPayload) {
    return this.post<void>(`${this.ROUTE_V1}/me/blocks`, payload);
  }

  public unblockCrew({ crewId }: UnblockCrewPayload) {
    return this.delete<void>(`${this.ROUTE_V1}/me/blocks/${crewId}`);
  }
}
