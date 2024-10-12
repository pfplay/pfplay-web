import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatEvent } from '@/shared/api/websocket/types/partyroom';

export type SystemChat = {
  from: 'system';
  content: string;
};

export type UserChat = {
  from: 'user';
  crew: PartyroomCrew;
  message: ChatEvent['message'];
  receivedAt: number;
};

export type Model = SystemChat | UserChat;
