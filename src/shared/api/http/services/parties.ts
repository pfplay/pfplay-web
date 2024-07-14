import { PaginationPayload, PaginationResponse } from '@/shared/api/http/types/@shared';
import { Singleton } from '@/shared/lib/decorators/singleton';
import { pfpAxiosInstance } from '../client/client';
import {
  CreatePartyroomRequest,
  CreatePartyroomResponse,
  PartiesClient,
  PartyroomSummary,
} from '../types/parties';

@Singleton
class PartiesService implements PartiesClient {
  private ROUTE_V1 = 'v1/party-room';

  public create(request: CreatePartyroomRequest) {
    return pfpAxiosInstance.post<unknown, CreatePartyroomResponse>(
      `${this.ROUTE_V1}/create`,
      request
    );
  }

  public getList(request: PaginationPayload) {
    return pfpAxiosInstance.get<unknown, PaginationResponse<PartyroomSummary>>(
      `${this.ROUTE_V1}/list`,
      {
        params: request,
      }
    );
  }
}

const instance = new PartiesService();
export default instance;
