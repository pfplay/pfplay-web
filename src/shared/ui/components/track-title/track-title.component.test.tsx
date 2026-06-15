import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='marquee'>{children}</div>
  ),
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({
  galmuriFont: { className: 'font-galmuri' },
}));

import TrackTitle from './track-title.component';

describe('TrackTitle', () => {
  test('name 있으면 Marquee 안에 곡명 + data-testid=video-title', () => {
    render(<TrackTitle name='Test Song' emptyText='없음' />);
    expect(screen.getByTestId('marquee')).toBeTruthy();
    const el = screen.getByTestId('video-title');
    expect(el.textContent).toBe('Test Song');
    expect(el.className).toMatch(/font-galmuri/);
  });

  test('name 없으면 emptyText + data-testid=video-title-empty (마퀴 없음)', () => {
    render(<TrackTitle emptyText='현재 DJ가 없습니다' />);
    expect(screen.queryByTestId('marquee')).toBeNull();
    const el = screen.getByTestId('video-title-empty');
    expect(el.textContent).toBe('현재 DJ가 없습니다');
    expect(el.className).toMatch(/font-galmuri/);
  });
});
