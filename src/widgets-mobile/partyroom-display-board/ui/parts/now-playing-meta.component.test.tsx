/**
 * @vitest-environment jsdom
 */
import React from 'react'; // mock 타입 참조용
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import NowPlayingMeta from './now-playing-meta.component';

vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({ galmuriFont: { className: 'font-galmuri' } }));

describe('NowPlayingMeta', () => {
  test('트랙명·DJ·duration 3 라인 렌더', () => {
    render(<NowPlayingMeta trackName='Test Track' djNickname='DJ Alpha' duration='3:45' />);
    expect(screen.getByText('Test Track')).toBeTruthy();
    expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
    expect(screen.getByText('3:45')).toBeTruthy();
  });

  test('djNickname 있으면 헤드셋 아이콘 + 닉네임', () => {
    const { container } = render(
      <NowPlayingMeta trackName='T' djNickname='DJ Alpha' duration='3:45' />
    );
    expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
    expect(container.querySelector('[data-testid="now-playing-dj"] svg')).toBeTruthy();
  });

  test('djNickname=null 시 DJ 라인(헤드셋 포함) 미렌더', () => {
    render(<NowPlayingMeta trackName='T' djNickname={null} duration='1:00' />);
    expect(screen.queryByTestId('now-playing-dj')).toBeNull();
  });

  test('root class — column 세로 stack (flex-col)', () => {
    const { container } = render(
      <NowPlayingMeta trackName='T' djNickname={null} duration='0:00' />
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bflex-col\b/);
  });

  test('parent flex 토큰 (flex-1 / min-w-0 등) 보유 X — 외부 배치는 NowPlayingRow 책임', () => {
    const { container } = render(<NowPlayingMeta trackName='T' djNickname='D' duration='0:00' />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/\bflex-1\b/);
    expect(root.className).not.toMatch(/\bmin-w-0\b/);
  });
});
