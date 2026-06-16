import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LobbyMenu from './lobby-menu.component';

const pushMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('@/shared/lib/router/use-app-router.hook', () => ({
  useAppRouter: () => ({ push: pushMock }),
}));

vi.mock('@/features/sign-out', () => ({
  useSignOut: () => signOutMock,
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      menu: {
        title: '메뉴',
        notification_settings: '알림 설정',
      },
      btn: {
        logout: '로그아웃',
      },
    },
  }),
}));

// Drawer 는 portal 로 렌더 — 테스트에서는 document.body 를 root 로 사용.
vi.mock('@/shared/lib/hooks/use-portal-root.hook', () => ({
  __esModule: true,
  default: () => document.body,
}));

describe('LobbyMenu', () => {
  beforeEach(() => {
    pushMock.mockClear();
    signOutMock.mockClear();
  });

  test('초기에는 메뉴 항목이 보이지 않는다', () => {
    render(<LobbyMenu />);
    expect(screen.queryByText('알림 설정')).toBeNull();
    expect(screen.queryByText('로그아웃')).toBeNull();
  });

  test('⋮ 클릭 → 메뉴 항목 노출', async () => {
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  test('알림 설정 클릭 → /settings/notifications 로 이동', async () => {
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    await userEvent.click(screen.getByText('알림 설정'));
    expect(pushMock).toHaveBeenCalledWith('/settings/notifications');
  });

  test('로그아웃 클릭 → signOut() 호출', async () => {
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    await userEvent.click(screen.getByText('로그아웃'));
    expect(signOutMock).toHaveBeenCalledTimes(1);
  });
});
