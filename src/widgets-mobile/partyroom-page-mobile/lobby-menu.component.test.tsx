import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LobbyMenu from './lobby-menu.component';

const pushMock = vi.fn();
const signOutMock = vi.fn();
const openInstallGuideMock = vi.fn();
/** 설치 진입점은 환경에 따라 숨겨진다 — 테스트마다 갈아끼운다. */
let canInstall = true;

vi.mock('@/shared/lib/router/use-app-router.hook', () => ({
  useAppRouter: () => ({ push: pushMock }),
}));

vi.mock('@/features/sign-out', () => ({
  useSignOut: () => signOutMock,
}));

vi.mock('@/features/pwa-install', () => ({
  useInstallGuide: () => ({ canInstall, openInstallGuide: openInstallGuideMock }),
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
    pwa: {
      menu_label: '앱 설치하기',
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
    openInstallGuideMock.mockClear();
    canInstall = true;
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

  test('설치 가능하면 앱 설치하기 항목이 보인다', async () => {
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    expect(screen.getByText('앱 설치하기')).toBeInTheDocument();
  });

  test('이미 설치했거나 설치 불가 환경이면 항목을 숨긴다', async () => {
    canInstall = false;
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    expect(screen.queryByText('앱 설치하기')).toBeNull();
    // 다른 항목은 그대로여야 한다.
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
  });

  test('앱 설치하기 클릭 → 설치 안내를 연다', async () => {
    render(<LobbyMenu />);
    await userEvent.click(screen.getByRole('button', { name: '메뉴' }));
    await userEvent.click(screen.getByText('앱 설치하기'));

    expect(openInstallGuideMock).toHaveBeenCalledTimes(1);
  });
});
