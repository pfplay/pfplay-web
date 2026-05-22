import { Singleton } from '@/shared/lib/decorators/singleton';
import HTTPClient from '../client/client';

export interface SubmitBugReportRequest {
  content: string;
  partyroomId?: number;
}

export interface SubmitBugReportResponse {
  bugReportId: number;
}

@Singleton
export default class BugReportsService extends HTTPClient {
  private ROUTE_V1 = 'v1/voc/bug-reports';

  public submit(body: SubmitBugReportRequest) {
    return this.post<SubmitBugReportResponse>(this.ROUTE_V1, body);
  }
}
