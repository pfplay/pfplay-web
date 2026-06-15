import type * as ChatMessage from '@/entities/current-partyroom/model/chat-message.model';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';

type SystemChat = Extract<ChatMessage.Model, { from: 'system' }>;

export function renderSystemChatMessage(message: SystemChat, templates: { crewEntered: string }) {
  if (message.variant === 'presence') {
    return processI18nString(templates.crewEntered, message.values);
  }

  return message.content;
}
