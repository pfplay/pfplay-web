import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

let mockChatMessages: any[] = [];
let mockIsBlockedCrew: (crewId: number) => boolean = () => false;
const mockScrollContainerRef = vi.fn();
const mockLastItemRef = vi.fn();

const mockAdjustGrade = vi.fn();
const mockRemoveChatMessage = vi.fn();
const mockImposePenalty = vi.fn();
const mockBlockCrew = vi.fn();
const mockSend = vi.fn();

vi.mock('@/entities/current-partyroom', () => ({
  useCurrentPartyroomChat: () => mockChatMessages,
}));
vi.mock('@/entities/current-partyroom/lib/alerts/use-alert.hook', () => ({
  __esModule: true,
  default: vi.fn(),
}));
vi.mock('@/features/partyroom/adjust-grade', () => ({
  useAdjustGrade: () => mockAdjustGrade,
  useCanAdjustGrade: () => () => false,
}));
vi.mock('@/features/partyroom/block-crew', () => ({
  useBlockCrew: () => mockBlockCrew,
}));
vi.mock('@/features/partyroom/impose-penalty', () => ({
  useRemoveChatMessage: () => mockRemoveChatMessage,
  useImposePenalty: () => mockImposePenalty,
  useCanRemoveChatMessage: () => () => false,
  useCanImposePenalty: () => () => false,
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
vi.mock('@/shared/lib/hooks/use-vertical-stretch.hook', () => ({
  useVerticalStretch: () => vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    chat: {
      para: {
        crew_entered: '{{nickname}} joined the room.',
        start_chat: 'Start chatting',
        chat_banned_hint: 'Banned',
      },
    },
    common: {
      btn: {
        authority: 'Authority',
        delete: 'Delete',
        chat_mute: 'Mute',
        kick: 'Kick',
        ban: 'Ban',
        block: 'Block',
      },
    },
  }),
}));
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: any) =>
      selector({
        me: {
          crewId: 999,
        },
      }),
  }),
}));
vi.mock('@/shared/ui/components/display-option-menu-on-hover-listener', () => ({
  DisplayOptionMenuOnHoverListener: ({ children }: any) => <>{children}</>,
}));
vi.mock('@/shared/ui/components/tooltip', () => ({
  TooltipTrigger: ({ children }: any) => <>{children}</>,
}));
vi.mock('./chat-item.component', () => ({
  __esModule: true,
  default: React.forwardRef<HTMLDivElement, any>(({ message }, ref) => (
    <div ref={ref} data-testid='chat-item'>
      {message.message.content}
    </div>
  )),
}));

import PartyroomChatPanel from './partyroom-chat-panel.component';

beforeEach(() => {
  mockChatMessages = [];
  mockIsBlockedCrew = () => false;
  mockAdjustGrade.mockReset();
  mockRemoveChatMessage.mockReset();
  mockImposePenalty.mockReset();
  mockBlockCrew.mockReset();
  mockSend.mockReset();
  mockScrollContainerRef.mockReset();
  mockLastItemRef.mockReset();
});

describe('PartyroomChatPanel', () => {
  test('renders legacy alert system messages as plain text without ChatItem', () => {
    mockChatMessages = [{ from: 'system', content: '관리자 메시지', receivedAt: 1 }];

    render(<PartyroomChatPanel />);

    const message = screen.getByText('관리자 메시지');

    expect(message).toBeTruthy();
    expect(message.className).toContain('text-red-200');
    expect(message.className).toContain('p-2');
    expect(message.className).toContain('pl-[58px]');
    expect(message.className).not.toContain('text-gray-500');
    expect(message.className).not.toContain('text-center');
    expect(message.className).not.toContain('text-xs');
    expect(screen.queryByTestId('chat-item')).toBeNull();
  });

  test('renders presence system messages with localized nickname interpolation and presence styling', () => {
    mockChatMessages = [
      {
        from: 'system',
        variant: 'presence',
        i18nKey: 'chat.para.crew_entered',
        values: { nickname: 'Alex' },
        receivedAt: 2,
      },
    ];

    render(<PartyroomChatPanel />);

    const presenceMessage = screen.getByText('Alex joined the room.');

    expect(presenceMessage).toBeTruthy();
    expect(presenceMessage.className).toContain('text-gray-500');
    expect(presenceMessage.className).toContain('text-center');
    expect(presenceMessage.className).toContain('text-xs');
    expect(presenceMessage.className).not.toContain('text-red-200');
    expect(presenceMessage.className).not.toContain('pl-[58px]');
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

    render(<PartyroomChatPanel />);

    expect(mockLastItemRef).toHaveBeenCalledWith(screen.getByText('Guest joined the room.'));
  });
});
