global.ResizeObserver = class ResizeObserver {
  public observe() {
    /* noop */
  }
  public unobserve() {
    /* noop */
  }
  public disconnect() {
    /* noop */
  }
} as any;

vi.mock('@/shared/lib/localization/i18n.context');

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import ChatEmojiPicker from './chat-emoji-picker.component';
import { CHAT_EMOJIS } from '../lib/emoji-set';
import { RECENT_EMOJIS_STORAGE_KEY } from '../lib/use-recent-emojis.hook';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    chat: {
      btn: { choose_emoji: '이모지 선택' },
      title: { recently_used: '최근 사용' },
    },
  });
});

describe('ChatEmojiPicker (#439)', () => {
  test('트리거 클릭 → 패널 열림 + 이모지 40개 렌더 + 빈 recents 섹션 미표시', async () => {
    const user = userEvent.setup();
    render(<ChatEmojiPicker onSelect={vi.fn()} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));

    const panel = await screen.findByTestId('chat-emoji-panel');
    expect(panel).toBeInTheDocument();
    expect(screen.queryByTestId('chat-emoji-recents')).not.toBeInTheDocument();
    expect(screen.getByTestId('chat-emoji-grid').children).toHaveLength(CHAT_EMOJIS.length);
  });

  test('이모지 클릭 → onSelect 호출 + 패널 유지 + recents 저장', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClosed = vi.fn();
    render(<ChatEmojiPicker onSelect={onSelect} onClosed={onClosed} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');
    await user.click(screen.getByRole('button', { name: '🎧' }));

    expect(onSelect).toHaveBeenCalledWith('🎧');
    expect(screen.getByTestId('chat-emoji-panel')).toBeInTheDocument(); // 연속 선택 위해 유지
    expect(JSON.parse(localStorage.getItem(RECENT_EMOJIS_STORAGE_KEY) ?? '')).toEqual(['🎧']);
    expect(onClosed).not.toHaveBeenCalled();
  });

  test('disabled → 클릭해도 패널이 열리지 않는다', async () => {
    const user = userEvent.setup();
    render(<ChatEmojiPicker onSelect={vi.fn()} disabled />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));

    expect(screen.queryByTestId('chat-emoji-panel')).not.toBeInTheDocument();
  });

  test('recents 비어 있으면 최근 사용 섹션 미표시, 시드되어 있으면 표시', async () => {
    const user = userEvent.setup();
    localStorage.setItem(RECENT_EMOJIS_STORAGE_KEY, JSON.stringify(['🔥', '🎉']));
    render(<ChatEmojiPicker onSelect={vi.fn()} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');

    const recents = await screen.findByTestId('chat-emoji-recents');
    expect(recents.children).toHaveLength(2);
    expect(recents.children[0]).toHaveTextContent('🔥');
  });

  test('ESC로 닫히면 onClosed 호출 (입력창 포커스 복귀 채널)', async () => {
    const user = userEvent.setup();
    const onClosed = vi.fn();
    render(<ChatEmojiPicker onSelect={vi.fn()} onClosed={onClosed} />);

    await user.click(screen.getByTestId('chat-emoji-trigger'));
    await screen.findByTestId('chat-emoji-panel');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByTestId('chat-emoji-panel')).not.toBeInTheDocument());
    await waitFor(() => expect(onClosed).toHaveBeenCalledTimes(1));
  });
});
