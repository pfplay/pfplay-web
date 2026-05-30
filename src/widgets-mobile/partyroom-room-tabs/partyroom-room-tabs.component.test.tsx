/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

let mockCrews: any[] = [];
let mockDjs: any[] = [];

vi.mock('@/widgets-mobile/partyroom-chat-panel', () => ({
  MobilePartyroomChatPanel: () => <div data-testid='chat-panel-stub' />,
}));
vi.mock('@/widgets-mobile/partyroom-crews-panel', () => ({
  MobilePartyroomCrewsPanel: () => <div data-testid='crews-panel-stub' />,
}));
vi.mock('@/widgets-mobile/partyroom-queue-panel', () => ({
  MobilePartyroomQueuePanel: ({ partyroomId }: { partyroomId: number }) => (
    <div data-testid='queue-panel-stub' data-partyroom-id={partyroomId} />
  ),
}));
vi.mock('@/features/partyroom/list-crews', () => ({
  useCurrentPartyroomCrews: () => mockCrews,
}));
vi.mock('@/features/partyroom/list-djing-queue', () => ({
  useFetchDjingQueue: () => ({ data: { djs: mockDjs } }),
}));

import MobilePartyroomRoomTabs from './partyroom-room-tabs.component';

beforeEach(() => {
  mockCrews = [
    { crewId: 1, nickname: 'A' },
    { crewId: 2, nickname: 'B' },
  ];
  mockDjs = [];
  window.history.replaceState(null, '', '/parties/1');
});

describe('MobilePartyroomRoomTabs', () => {
  test('초기 진입 시 채팅 탭이 활성', () => {
    render(<MobilePartyroomRoomTabs partyroomId={1} />);
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('true');
  });

  test('크루 탭 클릭 → aria-selected + crews-panel 가시 (mount 유지, hidden 토글)', () => {
    render(<MobilePartyroomRoomTabs partyroomId={1} />);
    fireEvent.click(screen.getByTestId('mobile-tab-crew'));
    expect(screen.getByTestId('mobile-tab-crew').getAttribute('aria-selected')).toBe('true');
    // .hidden boolean property 로 단언 (jsdom attribute 직렬화 edge 회피)
    const crewSection = screen
      .getByTestId('crews-panel-stub')
      .closest('[data-tab-content="crew"]') as HTMLElement;
    const chatSection = screen
      .getByTestId('chat-panel-stub')
      .closest('[data-tab-content="chat"]') as HTMLElement;
    expect(crewSection.hidden).toBe(false);
    expect(chatSection.hidden).toBe(true);
    // 회귀 가드: HTML hidden attribute 만으로는 Tailwind `.flex { display:flex }` 와
    // specificity 동률이라 display:none 강제가 안 됨 → 채팅 패널이 다른 탭 위로 비쳐 보이는 버그.
    // 비활성 탭은 utility `hidden` class (twMerge) 가 적용되어 display:none 가 적용돼야 함.
    expect(chatSection.className).toContain('hidden');
    expect(crewSection.className).not.toContain('hidden');
  });

  test('큐 탭 클릭 → MobilePartyroomQueuePanel 가시 (partyroomId prop 전달)', () => {
    render(<MobilePartyroomRoomTabs partyroomId={42} />);
    fireEvent.click(screen.getByTestId('mobile-tab-queue'));
    const queueStub = screen.getByTestId('queue-panel-stub');
    expect(queueStub).toBeTruthy();
    expect(queueStub.getAttribute('data-partyroom-id')).toBe('42');
  });

  test('탭바에 크루 카운트 = useCurrentPartyroomCrews().length', () => {
    mockCrews = [
      { crewId: 1, nickname: 'A' },
      { crewId: 2, nickname: 'B' },
      { crewId: 3, nickname: 'C' },
    ];
    render(<MobilePartyroomRoomTabs partyroomId={1} />);
    expect(screen.getByTestId('mobile-tab-crew').textContent).toContain('3');
  });

  test('탭바에 DJ 큐 카운트 = useFetchDjingQueue().data.djs.length (chunk 4)', () => {
    mockDjs = [
      { crewId: 1, orderNumber: 1 },
      { crewId: 2, orderNumber: 2 },
    ];
    render(<MobilePartyroomRoomTabs partyroomId={1} />);
    expect(screen.getByTestId('mobile-tab-queue').textContent).toContain('2');
  });

  test('mount 시 hash=#queue → 큐 탭 활성', async () => {
    window.history.replaceState(null, '', '/parties/1#queue');
    render(<MobilePartyroomRoomTabs partyroomId={1} />);
    // useEffect mount 후 hash 읽어 정정
    await Promise.resolve();
    expect(screen.getByTestId('mobile-tab-queue').getAttribute('aria-selected')).toBe('true');
  });
});
