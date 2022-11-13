import { Session } from 'next-auth';

export interface SessionWithAuth extends Session {
  access_token?: string;
}
