import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const pushMock = vi.fn();
const openDialogMock = vi.fn();
const informSocialTypeMock = vi.fn();
const isGuestMock = vi.fn();
const observeMock = vi.fn();
let resizeStage: (height: number) => void = () => undefined;

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('@/entities/me', () => ({ useIsGuest: () => isGuestMock }));
vi.mock('@/features/edit-profile-bio', () => ({
  ProfileEditFormV2: ({ onClickAvatarSetting }: { onClickAvatarSetting: () => void }) => (
    <button data-testid='profile-edit-form' onClick={onClickAvatarSetting} />
  ),
}));
vi.mock('@/features/partyroom/get-summary', () => ({
  useFetchPartyroomDetailSummary: () => ({ data: { title: 'Room' } }),
}));
vi.mock('@/features/partyroom/share-link', () => ({ useSharePartyroom: () => vi.fn() }));
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: () => informSocialTypeMock,
}));
vi.mock('@/features-mobile/playlist/manage', () => ({ useOpenPlaylistsManagement: () => vi.fn() }));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: { btn: { my_profile: '내 프로필' } },
    dj: { title: { current_dj: 'Now DJing' } },
  }),
}));
vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openDialog: openDialogMock }),
}));
vi.mock('@/widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component', () => ({
  __esModule: true,
  default: ({ expandedTop, onExpandedChange }: any) => (
    <div data-testid='chat-panel' data-expanded-top={expandedTop}>
      <button onClick={() => onExpandedChange(true)}>Expand chat</button>
    </div>
  ),
}));
vi.mock('@/widgets-mobile/partyroom-display-board', () => ({
  MobilePartyroomDisplayBoard: () => <div data-testid='stage-board' />,
}));
vi.mock('@/widgets-mobile/partyroom-djing-sheet', () => ({
  FullscreenSheetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  NowDjingSheet: () => null,
  SheetHost: () => null,
  useFullscreenSheet: () => ({ push: vi.fn() }),
}));
vi.mock('./mobile-room-action-bar.component', () => ({
  __esModule: true,
  default: ({ onOpenProfile }: { onOpenProfile: () => void }) => (
    <button aria-label='내 프로필' onClick={onOpenProfile} />
  ),
}));

import MobileRoom from './room.component';

describe('MobileRoom profile navigation', () => {
  beforeEach(() => {
    pushMock.mockReset();
    openDialogMock.mockReset();
    informSocialTypeMock.mockReset();
    isGuestMock.mockReset();
    observeMock.mockReset();
    resizeStage = () => undefined;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private target: Element | null = null;
        public constructor(private readonly callback: ResizeObserverCallback) {
          resizeStage = (height) => {
            if (!this.target) return;
            this.callback(
              [{ target: this.target, contentRect: { height } } as ResizeObserverEntry],
              this as unknown as ResizeObserver
            );
          };
        }
        public observe = (target: Element) => {
          this.target = target;
          observeMock(target);
          this.callback(
            [{ target, contentRect: { height: 400 } } as ResizeObserverEntry],
            this as unknown as ResizeObserver
          );
        };
        public disconnect = vi.fn();
        public unobserve = vi.fn();
      }
    );
  });

  test('signed-in user opens profile dialog instead of navigating to the guarded settings route', async () => {
    isGuestMock.mockResolvedValue(false);
    render(<MobileRoom partyroomId={1} />);

    fireEvent.click(screen.getByRole('button', { name: '내 프로필' }));

    await vi.waitFor(() => expect(openDialogMock).toHaveBeenCalledOnce());
    const dialogConfig = openDialogMock.mock.calls[0][0](
      () => undefined,
      () => undefined
    );
    expect(dialogConfig.fullScreen).toBe(true);
    expect(dialogConfig.title).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalledWith('/settings/profile');
  });

  test('guest profile action opens the existing sign-in prompt', async () => {
    isGuestMock.mockResolvedValue(true);
    render(<MobileRoom partyroomId={1} />);

    fireEvent.click(screen.getByRole('button', { name: '내 프로필' }));

    await vi.waitFor(() => expect(informSocialTypeMock).toHaveBeenCalledOnce());
    expect(openDialogMock).not.toHaveBeenCalled();
  });

  test('expanded chat starts below the measured stage and follows stage height changes', async () => {
    render(<MobileRoom partyroomId={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand chat' }));

    expect(observeMock).toHaveBeenCalledOnce();
    expect(screen.getByTestId('chat-panel')).toHaveAttribute('data-expanded-top', '416');

    act(() => resizeStage(520));
    await waitFor(() => {
      expect(screen.getByTestId('chat-panel')).toHaveAttribute('data-expanded-top', '536');
    });
  });
});
