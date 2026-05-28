/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

let mockCrews: any[] = [];

vi.mock('@/widgets-mobile/partyroom-chat-panel', () => ({
  MobilePartyroomChatPanel: () => <div data-testid='chat-panel-stub' />,
}));
vi.mock('@/widgets-mobile/partyroom-crews-panel', () => ({
  MobilePartyroomCrewsPanel: () => <div data-testid='crews-panel-stub' />,
}));
vi.mock('@/features/partyroom/list-crews', () => ({
  useCurrentPartyroomCrews: () => mockCrews,
}));

import MobilePartyroomRoomTabs from './partyroom-room-tabs.component';

beforeEach(() => {
  mockCrews = [
    { crewId: 1, nickname: 'A' },
    { crewId: 2, nickname: 'B' },
  ];
  window.history.replaceState(null, '', '/parties/1');
});

describe('MobilePartyroomRoomTabs', () => {
  test('초기 진입 시 채팅 탭이 활성', () => {
    render(<MobilePartyroomRoomTabs />);
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('true');
  });

  test('크루 탭 클릭 → aria-selected + crews-panel 가시 (mount 유지, hidden 토글)', () => {
    render(<MobilePartyroomRoomTabs />);
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

  test('큐 탭 클릭 → placeholder 가시', () => {
    render(<MobilePartyroomRoomTabs />);
    fireEvent.click(screen.getByTestId('mobile-tab-queue'));
    expect(screen.getByText(/곧 큐잉/)).toBeTruthy();
  });

  test('탭바에 크루 카운트 = useCurrentPartyroomCrews().length', () => {
    mockCrews = [
      { crewId: 1, nickname: 'A' },
      { crewId: 2, nickname: 'B' },
      { crewId: 3, nickname: 'C' },
    ];
    render(<MobilePartyroomRoomTabs />);
    expect(screen.getByTestId('mobile-tab-crew').textContent).toContain('3');
  });

  test('mount 시 hash=#queue → 큐 탭 활성', async () => {
    window.history.replaceState(null, '', '/parties/1#queue');
    render(<MobilePartyroomRoomTabs />);
    // useEffect mount 후 hash 읽어 정정
    await Promise.resolve();
    expect(screen.getByTestId('mobile-tab-queue').getAttribute('aria-selected')).toBe('true');
  });
});
