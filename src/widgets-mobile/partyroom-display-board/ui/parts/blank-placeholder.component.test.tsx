/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import BlankPlaceholder from './blank-placeholder.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ partyroom: { queue: { no_track: '지금 재생 중인 곡이 없어요' } } }),
}));

describe('BlankPlaceholder', () => {
  test('inline 한국어 안내 텍스트 렌더 (spec §6.3, §3 row 11)', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByText('지금 재생 중인 곡이 없어요')).toBeTruthy();
  });

  test('wrapper-fill class (w-full h-full + center) — wrapper aspect 책임은 VideoFrame', () => {
    const { container } = render(<BlankPlaceholder />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/\bw-full\b/);
    expect(root.className).toMatch(/\bh-full\b/);
    expect(root.className).toMatch(/\bflex\b/);
    expect(root.className).toMatch(/\bitems-center\b/);
    expect(root.className).toMatch(/\bjustify-center\b/);
    expect(root.className).not.toMatch(/\baspect-video\b/);
    expect(root.className).not.toMatch(/\bbg-black\b/);
    expect(root.className).not.toMatch(/\brounded\b/);
  });

  test('data-testid="blank-placeholder" 단언', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
  });
});
