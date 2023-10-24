import { AvatarType } from '@/api/@types/@enums';

export interface AvatarParts {
  id: number;
  type: AvatarType;
  name: string;
  image: string;
  point: number;
  purchased: boolean; // FIXME: BE api 상세 변경에 따라 수정
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarParts[]>;
}
