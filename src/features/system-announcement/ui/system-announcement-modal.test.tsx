vi.mock('@/shared/ui/components/dialog', () => ({
  Dialog: Object.assign(
    ({ open, Body, onClose: _onClose }: any) => {
      if (!open) return null;
      const BodyContent = typeof Body === 'function' ? Body : () => Body;
      return (
        <div data-testid='dialog'>
          <BodyContent />
        </div>
      );
    },
    {
      ButtonGroup: ({ children }: any) => <div data-testid='button-group'>{children}</div>,
      Button: ({ children, onClick }: any) => (
        <button data-testid='dialog-button' onClick={onClick}>
          {children}
        </button>
      ),
    }
  ),
}));

vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SystemAnnouncementModal from './system-announcement-modal';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';

beforeEach(() => {
  useSystemAnnouncementStore.setState({
    currentAnnouncement: null,
    dismissedIds: new Set(),
  });
});

describe('SystemAnnouncementModal', () => {
  test('공지가 없으면 모달이 보이지 않음', () => {
    render(<SystemAnnouncementModal />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  test('공지가 있으면 모달이 보임', () => {
    act(() => {
      useSystemAnnouncementStore.getState().showAnnouncement({
        id: 'test-1',
        type: 'MAINTENANCE',
        title: '점검 안내',
        content: '점검입니다.',
      });
    });

    render(<SystemAnnouncementModal />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  test('확인 버튼 클릭 시 dismiss', async () => {
    act(() => {
      useSystemAnnouncementStore.getState().showAnnouncement({
        id: 'test-2',
        type: 'MAINTENANCE',
        title: '점검 안내',
        content: '점검입니다.',
      });
    });

    render(<SystemAnnouncementModal />);
    await userEvent.click(screen.getByTestId('dialog-button'));

    expect(useSystemAnnouncementStore.getState().currentAnnouncement).toBeNull();
    expect(useSystemAnnouncementStore.getState().isDismissed('test-2')).toBe(true);
  });
});
