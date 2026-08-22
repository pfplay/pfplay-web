import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import InstallFab from './install-fab.component';

const openInstallGuideMock = vi.fn();
/** 설치 진입점은 환경에 따라 숨겨진다 — 테스트마다 갈아끼운다. */
let canInstall = true;

vi.mock('./use-install-guide.hook', () => ({
  __esModule: true,
  default: () => ({ canInstall, openInstallGuide: openInstallGuideMock }),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    pwa: {
      menu_label: '앱 설치하기',
    },
  }),
}));

describe('InstallFab', () => {
  beforeEach(() => {
    openInstallGuideMock.mockClear();
    canInstall = true;
  });

  test('설치 가능하면 버튼이 보인다', () => {
    render(<InstallFab />);
    expect(screen.getByRole('button', { name: '앱 설치하기' })).toBeInTheDocument();
  });

  test('이미 설치했거나 설치 불가 환경이면 아무것도 렌더하지 않는다', () => {
    canInstall = false;
    const { container } = render(<InstallFab />);
    expect(container).toBeEmptyDOMElement();
  });

  test('클릭 → 설치 안내를 연다', async () => {
    render(<InstallFab />);
    await userEvent.click(screen.getByRole('button', { name: '앱 설치하기' }));
    expect(openInstallGuideMock).toHaveBeenCalledTimes(1);
  });
});
