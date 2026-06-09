import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TabBar from './tab-bar.component';

describe('mobile TabBar', () => {
  test('3 버튼 (채팅·크루·큐) 렌더', () => {
    render(<TabBar activeTab='chat' crewCount={5} queueCount={0} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-chat')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-crew')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-queue')).toBeTruthy();
  });

  test('각 탭 PF 아이콘 + 카운트 렌더', () => {
    render(<TabBar activeTab='chat' crewCount={12} queueCount={4} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-chat').querySelector('svg')).toBeTruthy();
    const crew = screen.getByTestId('mobile-tab-crew');
    expect(crew.querySelector('svg')).toBeTruthy();
    expect(crew.textContent).toContain('12');
    const queue = screen.getByTestId('mobile-tab-queue');
    expect(queue.querySelector('svg')).toBeTruthy();
    expect(queue.textContent).toContain('4');
  });

  test('활성 탭은 레드 강조 클래스', () => {
    render(<TabBar activeTab='crew' crewCount={5} queueCount={0} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').className).toMatch(/text-red-/);
  });

  test('활성 탭은 aria-selected=true', () => {
    render(<TabBar activeTab='crew' crewCount={5} queueCount={0} onTabClick={vi.fn()} />);
    expect(screen.getByTestId('mobile-tab-crew').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('mobile-tab-chat').getAttribute('aria-selected')).toBe('false');
  });

  test('탭 클릭 → onTabClick 콜백 호출 (해당 TabKey 인자)', () => {
    const onTabClick = vi.fn();
    render(<TabBar activeTab='chat' crewCount={5} queueCount={0} onTabClick={onTabClick} />);
    fireEvent.click(screen.getByTestId('mobile-tab-crew'));
    expect(onTabClick).toHaveBeenCalledWith('crew');
  });

  test('카운트만 보이는 탭(크루·큐)은 aria-label 로 의미 전달 + 아이콘은 aria-hidden', () => {
    render(<TabBar activeTab='chat' crewCount={12} queueCount={4} onTabClick={vi.fn()} />);
    const crew = screen.getByTestId('mobile-tab-crew');
    const queue = screen.getByTestId('mobile-tab-queue');
    expect(crew.getAttribute('aria-label')).toBe('크루 12');
    expect(queue.getAttribute('aria-label')).toBe('DJ 큐 4');
    expect(crew.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(queue.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
