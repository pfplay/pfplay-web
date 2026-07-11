import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatMessageSentEvent } from '@/shared/api/websocket/types/partyroom';
import type { SummaryCounts } from './playback-summary-tracker';

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
  counts: SummaryCounts;
  skipped: boolean;
  receivedAt: number;
};

export type Model = SystemChat | UserChat | PlaybackSummaryChat;
