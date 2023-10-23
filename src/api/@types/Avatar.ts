import { AvatarType } from '@/api/@types/@enums';

export interface AvatarParts {
  id: number;
  type: AvatarType;
  name: string;
  image: string;
  point: number;
  purchased: boolean;
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarParts[]>;
}
