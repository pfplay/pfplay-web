import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';
import { ChatMessageSentEvent } from '@/shared/api/websocket/types/partyroom';

type BaseSystemChat = {
  from: 'system';
  messageId?: string;
  receivedAt: number;
};

type AlertSystemChat = BaseSystemChat & {
  variant?: 'alert';
  content: string;
};

type PresenceSystemChat = BaseSystemChat & {
  variant: 'presence';
  i18nKey: 'chat.para.crew_entered';
  values: { nickname: string };
};

export type SystemChat = AlertSystemChat | PresenceSystemChat;

export type UserChat = {
  from: 'user';
  crew: PartyroomCrew;
  message: ChatMessageSentEvent['message'];
  receivedAt: number;
};

export type Model = SystemChat | UserChat;
