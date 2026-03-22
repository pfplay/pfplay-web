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

export type GetPlaybackHistoryPayload = {
  partyroomId: number;
};

export type PlaybackHistoryItem = {
  musicName: string;
  nickname: string;
  avatarIconUri: string;
};

export type SkipPlaybackPayload = {
  partyroomId: number;
};

export interface DjsClient {
  registerMeToQueue: (payload: RegisterMeToQueuePayload) => Promise<void>;
  unregisterMeFromQueue: (payload: UnregisterMeFromQueuePayload) => Promise<void>;
  unregisterDjFromQueue: (payload: UnregisterDjFromQueuePayload) => Promise<void>;
  getPlaybackHistories: (payload: GetPlaybackHistoryPayload) => Promise<PlaybackHistoryItem[]>;
  skipPlayback: (payload: SkipPlaybackPayload) => Promise<void>;
}
