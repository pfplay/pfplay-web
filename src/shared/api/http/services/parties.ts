import { PaginationPayload, PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';
import type {
  CreatePartyroomRequest,
  CreatePartyroomResponse,
  PartiesClient,
  PartyroomSummary,
} from '../types/parties';

@Singleton
class PartiesService extends HTTPClient implements PartiesClient {
  private ROUTE_V1 = 'v1/party-room';

  public create(request: CreatePartyroomRequest) {
    return this.post<CreatePartyroomResponse>(`${this.ROUTE_V1}/create`, request);
  }

  public getList(request: PaginationPayload) {
    return this.get<PaginationResponse<PartyroomSummary>>(`${this.ROUTE_V1}/list`, {
      params: request,
    });
  }
}

const instance = new PartiesService();
export default instance;
