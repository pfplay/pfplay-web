import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import NotificationToggle from './notification-toggle.component';
import type { PushStatus } from '../lib/use-push-subscription';

const enableMock = vi.fn();
const disableMock = vi.fn();
const usePushSubscriptionMock = vi.fn();

vi.mock('../lib/use-push-subscription', () => ({
  __esModule: true,
  default: () => usePushSubscriptionMock(),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    settings: {
      notifications: {
        title: '알림',
        toggle_label: '공지 푸시 알림 받기',
        description: '운영 공지와 이벤트 소식을 받아볼 수 있어요.',
        needs_install_hint: '홈 화면에 앱을 추가한 뒤 알림을 켤 수 있어요.',
        denied_hint: '브라우저 설정에서 알림 차단을 해제해 주세요.',
      },
    },
  }),
}));

const setStatus = (status: PushStatus) =>
  usePushSubscriptionMock.mockReturnValue({ status, enable: enableMock, disable: disableMock });

beforeEach(() => {
  enableMock.mockReset();
  disableMock.mockReset();
  usePushSubscriptionMock.mockReset();
});

describe('NotificationToggle', () => {
  test('unsupported 상태에서는 아무것도 렌더하지 않는다', () => {
    setStatus('unsupported');
    const { container } = render(<NotificationToggle />);
    expect(container).toBeEmptyDOMElement();
  });

  test('needs-install 상태: 설치 힌트 노출 + 컨트롤 비활성', () => {
    setStatus('needs-install');
    render(<NotificationToggle />);

    expect(screen.getByText('홈 화면에 앱을 추가한 뒤 알림을 켤 수 있어요.')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  test('denied 상태: 차단 해제 힌트 노출 + 컨트롤 비활성', () => {
    setStatus('denied');
    render(<NotificationToggle />);

    expect(screen.getByText('브라우저 설정에서 알림 차단을 해제해 주세요.')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  test('pending 상태: 컨트롤 비활성', () => {
    setStatus('pending');
    render(<NotificationToggle />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  test('off 상태: 클릭 시 enable 호출', async () => {
    setStatus('off');
    render(<NotificationToggle />);

    const control = screen.getByRole('switch');
    expect(control).not.toBeDisabled();
    await userEvent.click(control);

    expect(enableMock).toHaveBeenCalledTimes(1);
    expect(disableMock).not.toHaveBeenCalled();
  });

  test('on 상태: 클릭 시 disable 호출', async () => {
    setStatus('on');
    render(<NotificationToggle />);

    const control = screen.getByRole('switch');
    expect(control).not.toBeDisabled();
    await userEvent.click(control);

    expect(disableMock).toHaveBeenCalledTimes(1);
    expect(enableMock).not.toHaveBeenCalled();
  });
});
