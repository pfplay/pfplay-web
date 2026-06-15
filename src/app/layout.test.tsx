import { ReactElement } from 'react';
import { Mock, beforeEach, describe, expect, test, vi } from 'vitest';

import { SystemAnnouncementSubscriber } from '@/features/system-announcement';
import { getEdgeConfigMaintenance, getSystemStatus } from '@/shared/api/system-status';
import RootLayout from './layout';

// next/font, CSS(css:false), 무거운 provider 들은 트리 식별/import 경량화를 위해 stub.
// 트리는 렌더하지 않고 element 트리를 walk 하므로 provider 본문은 실행되지 않는다.
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'en' }) }),
}));
vi.mock('@/shared/lib/localization/get-server-dictionary', () => ({
  getServerDictionary: vi.fn().mockResolvedValue({}),
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({
  pretendardVariable: { className: 'font' },
}));
vi.mock('@/shared/api/system-status', () => ({
  getEdgeConfigMaintenance: vi.fn(),
  getSystemStatus: vi.fn(),
}));
vi.mock('@/features/system-announcement', () => ({
  SystemAnnouncementSubscriber: () => null,
}));
vi.mock('@/features/system-announcement/ui/hydrate-announcements-from-status', () => ({
  default: () => null,
}));
vi.mock('@/features/system-announcement/ui/system-announcement-display', () => ({
  default: () => null,
}));
vi.mock('./_providers/react-query.provider', () => ({ default: ({ children }: any) => children }));
vi.mock('./_providers/analytics.provider', () => ({ default: ({ children }: any) => children }));
vi.mock('./_providers/stores.provider', () => ({ default: ({ children }: any) => children }));
vi.mock('./_providers/wallet.provider', () => ({
  WalletProvider: ({ children }: any) => children,
}));

const ACTIVE = {
  phase: 'ACTIVE' as const,
  startAt: '2026-06-15T03:00:00',
  endAt: '2026-06-15T04:00:00',
  messageKo: '점검 중',
  messageEn: 'Maintenance',
};

/** 렌더하지 않고 element 트리에 특정 컴포넌트 타입이 존재하는지 검사. */
function containsType(node: unknown, type: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some((n) => containsType(n, type));
  const el = node as { type?: unknown; props?: { children?: unknown } };
  if (el.type === type) return true;
  return containsType(el.props?.children, type);
}

const Child = () => null;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RootLayout — 점검 화면 격리 (#406)', () => {
  test('점검 ACTIVE 면 SystemAnnouncementSubscriber 를 마운트하지 않고 children 만 렌더한다', async () => {
    (getEdgeConfigMaintenance as Mock).mockResolvedValue(ACTIVE);

    const tree = (await RootLayout({ children: <Child /> })) as ReactElement;

    expect(containsType(tree, SystemAnnouncementSubscriber)).toBe(false);
    expect(containsType(tree, Child)).toBe(true);
    // 점검 중 백엔드는 down — getSystemStatus 를 호출하면 안 된다(불필요한 실패 호출 방지).
    expect(getSystemStatus).not.toHaveBeenCalled();
  });

  test('점검이 아니면 평소처럼 SystemAnnouncementSubscriber 를 마운트하고 getSystemStatus 를 호출한다', async () => {
    (getEdgeConfigMaintenance as Mock).mockResolvedValue(null);
    (getSystemStatus as Mock).mockResolvedValue({ activeAnnouncements: [], maintenance: null });

    const tree = (await RootLayout({ children: <Child /> })) as ReactElement;

    expect(containsType(tree, SystemAnnouncementSubscriber)).toBe(true);
    expect(containsType(tree, Child)).toBe(true);
    expect(getSystemStatus).toHaveBeenCalledTimes(1);
  });
});
