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
      title: { live: '실시간 채팅' },
      para: {
        start_chat: '무슨 얘기를 해볼까요?',
        chat_banned_hint: '관리자 제재로 30초 동안 채팅할 수 없어요.',
      },
    },
    common: { btn: { close: '닫기' } },
  }),
}));
vi.mock('./ui/parts/chat-item.component', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, { message: any }>(({ message }, ref) => (
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

  test('입력 포커스 시 채팅 패널이 확장되고 닫기 버튼으로 축소된다', () => {
    render(<MobilePartyroomChatPanel />);

    const panel = screen.getByTestId('mobile-chat-panel');
    const input = screen.getByTestId('chat-message-input');

    expect(panel).toHaveAttribute('data-expanded', 'false');
    fireEvent.focus(input);
    expect(panel).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByTestId('mobile-chat-close')).toBeTruthy();
    expect(screen.getByTestId('mobile-chat-scroll')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mobile-chat-close'));
    expect(panel).toHaveAttribute('data-expanded', 'false');
  });

  test('확장 패널은 고정 영역이고 메시지 목록만 스크롤된다', () => {
    render(<MobilePartyroomChatPanel overlay />);

    fireEvent.focus(screen.getByTestId('chat-message-input'));

    expect(screen.getByTestId('mobile-chat-scroll')).toBeInTheDocument();
  });

  test('메시지가 많아도 확장된 채팅 목록 안에서 렌더링된다', () => {
    mockChatMessages = Array.from({ length: 30 }, (_, index) => ({
      from: 'user',
      crew: { crewId: index + 1, nickname: `Crew ${index + 1}` },
      message: { content: `message ${index + 1}`, messageId: `m${index + 1}` },
      receivedAt: index + 1,
    }));
    render(<MobilePartyroomChatPanel overlay expanded />);

    const scrollArea = screen.getByTestId('mobile-chat-scroll');
    expect(scrollArea.querySelectorAll('[data-testid="chat-item"]')).toHaveLength(30);
  });

  test('확장 상태를 부모 레이아웃에 전달한다', () => {
    const onExpandedChange = vi.fn();
    render(<MobilePartyroomChatPanel overlay onExpandedChange={onExpandedChange} />);

    fireEvent.focus(screen.getByTestId('chat-message-input'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByTestId('mobile-chat-close'));
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  test('전송 버튼 클릭 → SendChatMessage.send 호출', () => {
    render(<MobilePartyroomChatPanel />);
    fireEvent.click(screen.getByTestId('chat-message-send-button'));
    expect(mockSend).toHaveBeenCalled();
  });
});
