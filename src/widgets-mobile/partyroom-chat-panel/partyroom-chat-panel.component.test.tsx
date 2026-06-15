import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

let mockChatMessages: any[] = [];
let mockIsBlockedCrew: (crewId: number) => boolean = () => false;
let mockSend = vi.fn();
const mockScrollContainerRef = vi.fn();
const mockLastItemRef = vi.fn();

vi.mock('@/entities/current-partyroom', () => ({
  useCurrentPartyroomChat: () => mockChatMessages,
}));
vi.mock('@/features/partyroom/list-chat-messages', () => ({
  useChatMessagesScrollManager: () => ({
    scrollContainerRef: mockScrollContainerRef,
    lastItemRef: mockLastItemRef,
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
        crew_entered: '{{nickname}} joined the room.',
      },
    },
  }),
}));
vi.mock('./ui/parts/chat-item.component', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>(({ message }, ref) => (
    <div ref={ref} data-testid='chat-item' data-crew-id={message.crew.crewId}>
      {message.message.content}
    </div>
  )),
}));

import MobilePartyroomChatPanel from './partyroom-chat-panel.component';

beforeEach(() => {
  mockChatMessages = [];
  mockIsBlockedCrew = () => false;
  mockSend = vi.fn();
  mockScrollContainerRef.mockReset();
  mockLastItemRef.mockReset();
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

  test('presence system 메시지는 i18n 텍스트로 렌더링한다', () => {
    mockChatMessages = [
      {
        from: 'system',
        variant: 'presence',
        i18nKey: 'chat.para.crew_entered',
        values: { nickname: 'Alex' },
        receivedAt: 3,
      },
    ];
    render(<MobilePartyroomChatPanel />);
    expect(screen.getByText('Alex joined the room.')).toBeTruthy();
    expect(screen.queryByText('{{nickname}} joined the room.')).toBeNull();
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('presence system 메시지가 마지막이면 scroll manager의 lastItemRef를 연결한다', () => {
    mockChatMessages = [
      {
        from: 'user',
        crew: { crewId: 1, nickname: 'Sam' },
        message: { content: 'hello', messageId: 'm1' },
        receivedAt: 1,
      },
      {
        from: 'system',
        variant: 'presence',
        i18nKey: 'chat.para.crew_entered',
        values: { nickname: 'Guest' },
        receivedAt: 2,
      },
    ];

    render(<MobilePartyroomChatPanel />);

    expect(mockLastItemRef).toHaveBeenCalledWith(screen.getByText('Guest joined the room.'));
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
