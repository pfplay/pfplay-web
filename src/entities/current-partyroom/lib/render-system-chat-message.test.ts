import { describe, expect, test } from 'vitest';
import type { SystemChat } from '@/entities/current-partyroom/model/chat-message.model';
import { renderSystemChatMessage } from './render-system-chat-message';

describe('renderSystemChatMessage', () => {
  test('returns alert content for legacy system messages', () => {
    const message: SystemChat = {
      from: 'system',
      content: '관리자 메시지',
      receivedAt: 1,
    };

    expect(
      renderSystemChatMessage(message, {
        crewEntered: '{{nickname}} joined the room.',
      })
    ).toBe('관리자 메시지');
  });

  test('interpolates presence system messages with the shared i18n processor', () => {
    const message: SystemChat = {
      from: 'system',
      variant: 'presence',
      i18nKey: 'chat.para.crew_entered',
      values: { nickname: 'Alex' },
      receivedAt: 2,
    };

    expect(
      renderSystemChatMessage(message, {
        crewEntered: '{{nickname}} joined the room.',
      })
    ).toBe('Alex joined the room.');
  });
});
