vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
vi.mock('@/entities/me', () => ({
  useFetchMe: vi.fn(),
}));
vi.mock('@/features/sign-out', () => ({
  useSignOut: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/lib/localization/language-change-menu.component', () => ({
  __esModule: true,
  default: () => <div data-testid='language-menu' />,
}));
vi.mock('@/shared/lib/hooks/use-intersection-observer.hook', () => ({
  __esModule: true,
  default: () => ({ isIntersecting: true, setRef: vi.fn(), observed: false }),
}));

import { render, screen } from '@testing-library/react';
import { useFetchMe } from '@/entities/me';
import { useSignOut } from '@/features/sign-out';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import Header from './header.component';

beforeEach(() => {
  vi.clearAllMocks();
  (useI18n as Mock).mockReturnValue({
    common: { btn: { logout: 'Logout' } },
  });
  (useSignOut as Mock).mockReturnValue(vi.fn());
});

describe('Header', () => {
  test('withLogo=true이면 로고를 렌더링한다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: null });
    render(<Header withLogo />);
    expect(screen.getByAltText('Pfplay Logo')).toBeTruthy();
  });

  test('withLogo 없으면 로고를 렌더링하지 않는다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: null });
    render(<Header />);
    expect(screen.queryByAltText('Pfplay Logo')).toBeFalsy();
  });

  test('비게스트 유저면 이메일 앞부분을 표시한다', () => {
    (useFetchMe as Mock).mockReturnValue({
      data: { email: 'test@example.com', authorityTier: AuthorityTier.FM },
    });
    render(<Header />);
    expect(screen.getByText('test')).toBeTruthy();
  });

  test('게스트 유저면 메뉴를 표시하지 않는다', () => {
    (useFetchMe as Mock).mockReturnValue({
      data: { email: 'guest@example.com', authorityTier: AuthorityTier.GT },
    });
    render(<Header />);
    expect(screen.queryByText('guest')).toBeFalsy();
  });

  test('LanguageChangeMenu를 항상 렌더링한다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: null });
    render(<Header />);
    expect(screen.getByTestId('language-menu')).toBeTruthy();
  });
});
