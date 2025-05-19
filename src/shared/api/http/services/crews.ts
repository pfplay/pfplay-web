import {
  BlockCrewPayload,
  UnblockCrewPayload,
  CrewsClient,
  BlockedCrew,
  GetCrewProfilePayload,
  CrewProfile,
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

  public unblockCrew({ blockId }: UnblockCrewPayload) {
    return this.delete<void>(`${this.ROUTE_V1}/me/blocks/${blockId}`);
  }

  public getCrewProfile({ crewId }: GetCrewProfilePayload) {
    return this.get<CrewProfile>(`${this.ROUTE_V1}/${crewId}/profile/summary`);
  }
}
