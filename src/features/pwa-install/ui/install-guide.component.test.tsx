import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import InstallGuide from './install-guide.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: { btn: { confirm: '확인', cancel: '취소' } },
    pwa: {
      description: '설명',
      install_now: '설치하기',
      manual_title: '홈 화면에 앱을 추가해 주세요',
      manual_chrome: 'CHROME_STEP',
      manual_samsung: 'SAMSUNG_STEP',
      manual_firefox: 'FIREFOX_STEP',
      manual_other: 'OTHER_STEP',
    },
  }),
}));

const SAMSUNG = 'Android 13; SM-S911N SamsungBrowser/23.0 Chrome/115 Mobile';
const FIREFOX = 'Android 14; Mobile; rv:120.0 Firefox/120.0';
const CHROME = 'Android 14; SM-S911N Chrome/120.0.0.0 Mobile';
const GENERIC = 'Android 14 Mobile Safari/537.36';

const setUserAgent = (ua: string) =>
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });

describe('InstallGuide · manual-guide', () => {
  afterEach(() => setUserAgent(CHROME));

  test.each([
    [SAMSUNG, 'SAMSUNG_STEP'],
    [FIREFOX, 'FIREFOX_STEP'],
    [CHROME, 'CHROME_STEP'],
    [GENERIC, 'OTHER_STEP'],
  ])('브라우저별 홈 화면 추가 경로를 안내한다 (%s)', (ua, expected) => {
    setUserAgent(ua);
    render(<InstallGuide environment='manual-guide' onClose={vi.fn()} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.getByText('홈 화면에 앱을 추가해 주세요')).toBeInTheDocument();
  });
});
