import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';

export type ChatType = 'user' | 'system';

export type SystemChat = {
  from: 'system';
  content: string;
  messageId: ChatEvent['message']['messageId'];
};

export type UserChat = {
  from: 'user';
  crew: PartyroomCrew;
  message: ChatEvent['message'];
  receivedAt: number;
};

export type Model = SystemChat | UserChat;
