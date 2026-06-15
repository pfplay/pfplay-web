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
  test('layout="column": 트랙명·DJ·duration 3 라인 렌더', () => {
    render(
      <NowPlayingMeta
        layout='column'
        trackName='Test Track'
        djNickname='DJ Alpha'
        duration='3:45'
      />
    );
    expect(screen.getByText('Test Track')).toBeTruthy();
    expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
    expect(screen.getByText('3:45')).toBeTruthy();
  });

  test('layout="row": 3 값 모두 렌더', () => {
    render(
      <NowPlayingMeta layout='row' trackName='Test Track' djNickname='DJ Beta' duration='2:10' />
    );
    expect(screen.getByText('Test Track')).toBeTruthy();
    expect(screen.getByText(/DJ Beta/)).toBeTruthy();
    expect(screen.getByText('2:10')).toBeTruthy();
  });

  test('djNickname 있으면 헤드셋 아이콘 + 닉네임', () => {
    const { container } = render(
      <NowPlayingMeta layout='column' trackName='T' djNickname='DJ Alpha' duration='3:45' />
    );
    expect(screen.getByText(/DJ Alpha/)).toBeTruthy();
    expect(container.querySelector('[data-testid="now-playing-dj"] svg')).toBeTruthy();
  });

  test('djNickname=null 시 DJ 라인(헤드셋 포함) 미렌더', () => {
    render(<NowPlayingMeta layout='column' trackName='T' djNickname={null} duration='1:00' />);
    expect(screen.queryByTestId('now-playing-dj')).toBeNull();
  });

  test('layout 분기 root class — column 은 flex-col, row 는 flex-row', () => {
    const { container, rerender } = render(
      <NowPlayingMeta layout='column' trackName='T' djNickname={null} duration='0:00' />
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bflex-col\b/);
    rerender(<NowPlayingMeta layout='row' trackName='T' djNickname={null} duration='0:00' />);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/\bflex-row\b/);
  });

  test('row variant 도 parent flex 토큰 (flex-1 / min-w-0 등) 보유 X', () => {
    const { container } = render(
      <NowPlayingMeta layout='row' trackName='T' djNickname='D' duration='0:00' />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/\bflex-1\b/);
    expect(root.className).not.toMatch(/\bmin-w-0\b/);
  });
});
