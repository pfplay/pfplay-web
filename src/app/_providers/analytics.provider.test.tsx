vi.mock('@/shared/lib/analytics', () => ({
  initAnalytics: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/shared/lib/analytics/auth-tracking', () => ({
  authTypeOf: vi.fn(() => 'GUEST'),
  identifyAuthenticatedUser: vi.fn(),
}));

import { act, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import * as Me from '@/entities/me/model/me.model';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { track } from '@/shared/lib/analytics';
import { identifyAuthenticatedUser } from '@/shared/lib/analytics/auth-tracking';
import AnalyticsProvider from './analytics.provider';

const guestMe = { uid: 'g123', authorityTier: AuthorityTier.GT } as unknown as Me.Model;
const memberMe = { uid: 'm456', authorityTier: AuthorityTier.FM } as unknown as Me.Model;

const renderWithCache = (seed?: Me.Model) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (seed) queryClient.setQueryData([QueryKeys.Me], seed);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = render(<AnalyticsProvider>child</AnalyticsProvider>, { wrapper });
  return { queryClient, ...utils };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AnalyticsProvider — B′ 게스트(GT) 미식별 가드', () => {
  test('게스트 me 가 캐시에 있으면 identifyAuthenticatedUser 를 호출하지 않는다', () => {
    renderWithCache(guestMe);
    expect(identifyAuthenticatedUser).not.toHaveBeenCalled();
  });

  test('멤버 me 가 캐시에 있으면 identifyAuthenticatedUser 를 멤버로 1회 호출한다', () => {
    renderWithCache(memberMe);
    expect(identifyAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(identifyAuthenticatedUser).toHaveBeenCalledWith({
      uid: 'm456',
      authorityTier: AuthorityTier.FM,
    });
  });

  test('게스트→멤버 전이: 게스트는 미식별, 멤버 전이 시 멤버로 1회만 식별', () => {
    const { queryClient } = renderWithCache(guestMe);
    expect(identifyAuthenticatedUser).not.toHaveBeenCalled();

    act(() => {
      queryClient.setQueryData([QueryKeys.Me], memberMe);
    });

    expect(identifyAuthenticatedUser).toHaveBeenCalledTimes(1);
    expect(identifyAuthenticatedUser).toHaveBeenCalledWith({
      uid: 'm456',
      authorityTier: AuthorityTier.FM,
    });
  });

  test('게스트 캐시 마운트에서도 Session Started 는 계속 발화한다', () => {
    renderWithCache(guestMe);
    expect(track).toHaveBeenCalledWith(
      'Session Started',
      expect.objectContaining({ authority_tier: AuthorityTier.GT })
    );
  });

  test('동일 uid 멤버 me 가 재설정돼도 identifyAuthenticatedUser 는 1회만 호출된다 (ref dedup)', () => {
    const { queryClient } = renderWithCache(memberMe);
    expect(identifyAuthenticatedUser).toHaveBeenCalledTimes(1);

    act(() => {
      queryClient.setQueryData([QueryKeys.Me], {
        uid: 'm456',
        authorityTier: AuthorityTier.FM,
      } as unknown as Me.Model);
    });

    expect(identifyAuthenticatedUser).toHaveBeenCalledTimes(1);
  });

  test('uid 없는 게스트성 me 는 조기 반환되어 identifyAuthenticatedUser 를 호출하지 않는다', () => {
    renderWithCache({ authorityTier: AuthorityTier.GT } as unknown as Me.Model);
    expect(identifyAuthenticatedUser).not.toHaveBeenCalled();
  });
});
