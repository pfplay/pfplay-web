import { ObtainmentType } from '@/shared/api/types/@enums';

export interface AvatarParts {
  id: number | string;
  type?: ObtainmentType;
  name: string;
  image: string;
  point?: number;
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarParts[]>;
  getFaceList(): Promise<AvatarParts[]>;
}
