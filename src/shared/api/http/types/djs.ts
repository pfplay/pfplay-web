import { Playlist } from '@/shared/api/http/types/playlists';

export type RegisterMeToQueuePayload = {
  partyroomId: number;
  playlistId: Playlist['id'];
};

export type UnregisterMeFromQueuePayload = {
  partyroomId: number;
};

export type UnregisterDjFromQueuePayload = {
  partyroomId: number;
  djId: number;
};

export type CompletePlaybackPayload = {
  partyroomId: number;
};

export type SkipPlaybackPayload = {
  partyroomId: number;
};

// TODO: 응답 있는지 확인 필요
export interface DjsClient {
  registerMeToQueue: (payload: RegisterMeToQueuePayload) => Promise<void>;
  unregisterMeFromQueue: (payload: UnregisterMeFromQueuePayload) => Promise<void>;
  unregisterDjFromQueue: (payload: UnregisterDjFromQueuePayload) => Promise<void>;
  completePlayback: (payload: CompletePlaybackPayload) => Promise<void>;
  skipPlayback: (payload: SkipPlaybackPayload) => Promise<void>;
}
