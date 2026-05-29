import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TabBar from './tab-bar.component';

describe('mobile TabBar', () => {
  test('3 버튼 (채팅·크루·큐) 렌더', () => {
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-chat')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-crew')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-queue')).toBeTruthy();
  });

  test('크루 라벨에 인원 카운트 표시', () => {
    render(<TabBar activeTab='chat' crewCount={12} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').textContent).toContain('12');
  });

  test('큐 탭은 chunk 3 시점 카운트 없이 라벨만 (chunk 4 wiring 까지 forward-evolution)', () => {
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={vi.fn()} />);
    const queueBtn = screen.getByTestId('mobile-tab-queue');
    expect(queueBtn.textContent).toMatch(/큐/);
    // 숫자 카운트 없음 (chunk 4 까지)
    expect(queueBtn.textContent).not.toMatch(/\d/);
  });

  test('활성 탭은 aria-selected=true', () => {
    render(<TabBar activeTab='crew' crewCount={5} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('false');
  });

  test('탭 클릭 → onTabClick 콜백 호출 (해당 TabKey 인자)', () => {
    const onTabClick = vi.fn();
    render(<TabBar activeTab='chat' crewCount={5} onTabClick={onTabClick} />);
    fireEvent.click(screen.getByTestId('mobile-tab-crew'));
    expect(onTabClick).toHaveBeenCalledWith('crew');
  });
});
