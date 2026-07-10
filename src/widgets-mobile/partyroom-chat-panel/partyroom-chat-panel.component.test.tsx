import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

let mockChatMessages: any[] = [];
let mockIsBlockedCrew: (crewId: number) => boolean = () => false;
let mockSend = vi.fn();

vi.mock('@/entities/current-partyroom', () => ({
  useCurrentPartyroomChat: () => mockChatMessages,
}));
vi.mock('@/features/partyroom/list-chat-messages', () => ({
  useChatMessagesScrollManager: () => ({
    scrollContainerRef: vi.fn(),
    lastItemRef: vi.fn(),
  }),
}));
vi.mock('@/features/partyroom/list-my-blocked-crews', () => ({
  useIsBlockedCrew: () => mockIsBlockedCrew,
}));
vi.mock('@/features/partyroom/send-chat-message', () => ({
  SendChatMessage: ({ children }: any) =>
    children({
      message: 'hi',
      setMessage: vi.fn(),
      send: mockSend,
      canSend: true,
    }),
  ChatEmojiPicker: (props: { disabled?: boolean }) => (
    <button data-testid='chat-emoji-trigger' disabled={props.disabled} />
  ),
}));
vi.mock('@/entities/current-partyroom/lib/alerts/use-alert.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    chat: {
      para: {
        start_chat: '무슨 얘기를 해볼까요?',
        chat_banned_hint: '관리자 제재로 30초 동안 채팅할 수 없어요.',
      },
    },
  }),
}));
vi.mock('./ui/parts/chat-item.component', () => ({
  __esModule: true,
  default: ({ message }: any) => (
    <div data-testid='chat-item' data-crew-id={message.crew.crewId}>
      {message.message.content}
    </div>
  ),
}));

import MobilePartyroomChatPanel from './partyroom-chat-panel.component';

beforeEach(() => {
  mockChatMessages = [];
  mockIsBlockedCrew = () => false;
  mockSend = vi.fn();
});

describe('MobilePartyroomChatPanel', () => {
  test('user 메시지를 ChatItem 으로 렌더링한다', () => {
    mockChatMessages = [
      {
        from: 'user',
        crew: { crewId: 1, nickname: 'A' },
        message: { content: 'hello', messageId: 'm1' },
        receivedAt: 1,
      },
    ];
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByTestId('chat-item').textContent).toContain('hello');
  });

  test('system 메시지는 빨간 텍스트로 렌더링한다 (ChatItem 사용 안 함)', () => {
    mockChatMessages = [
      { from: 'system', content: '관리자에 의해 30초간 채팅이 금지됩니다.', receivedAt: 1 },
    ];
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByText(/30초간 채팅이 금지/)).toBeTruthy();
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('블록된 crew 메시지는 숨긴다', () => {
    mockChatMessages = [
      {
        from: 'user',
        crew: { crewId: 7, nickname: 'Blocked' },
        message: { content: 'spam', messageId: 'm2' },
        receivedAt: 2,
      },
    ];
    mockIsBlockedCrew = (crewId: number) => crewId === 7;
    render(<MobilePartyroomChatPanel />);
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('입력부 placeholder 가 i18n 키로 표시된다', () => {
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByPlaceholderText('무슨 얘기를 해볼까요?')).toBeTruthy();
  });

  test('전송 버튼 클릭 → SendChatMessage.send 호출', () => {
    render(<MobilePartyroomChatPanel />);
    fireEvent.click(screen.getByTestId('chat-message-send-button'));
    expect(mockSend).toHaveBeenCalled();
  });
});
