import { AvatarType } from '@/api/@types/@enums';

export interface AvatarBody {
  id: number;
  type: AvatarType;
  name: string;
  image: string;
  point: number;
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarBody[]>;
}
