export interface AvatarBody {
  id: number;
  type: string;
  name: string;
  image: string;
  point: number;
}

export interface AvatarClient {
  getBodyList(): Promise<AvatarBody[]>;
}
