import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatMessageSentEvent } from '@/shared/api/websocket/types/partyroom';

export type SystemChat = {
  from: 'system';
  content: string;
  receivedAt: number;
};

export type UserChat = {
  from: 'user';
  crew: PartyroomCrew;
  message: ChatMessageSentEvent['message'];
  receivedAt: number;
};

export type PlaybackSummaryChat = {
  from: 'playback-summary';
  trackName: string;
  djNickname: string | null;
  counts: { like: number; dislike: number; grab: number };
  skipped: boolean;
  receivedAt: number;
};

export type Model = SystemChat | UserChat | PlaybackSummaryChat;
