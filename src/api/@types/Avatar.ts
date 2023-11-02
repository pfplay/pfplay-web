import { AvatarType } from '@/api/@types/@enums';

export interface AvatarParts {
  id: number;
  type: AvatarType;
  name: string;
  image: string;
  point: number;
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarParts[]>;
  getFaceList(): Promise<AvatarParts[]>;
}
