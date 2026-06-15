/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import TapToPlayButton from './tap-to-play-button.component';

describe('TapToPlayButton', () => {
  test('autoplayBlocked=true 시 visible (▶ + aria-label="재생")', () => {
    render(<TapToPlayButton autoplayBlocked={true} onTap={() => {}} />);
    expect(screen.getByRole('button', { name: '재생' })).toBeTruthy();
  });

  test('autoplayBlocked=false 시 미렌더', () => {
    const { container } = render(<TapToPlayButton autoplayBlocked={false} onTap={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  test('클릭 시 onTap 콜백 1회', () => {
    const onTap = vi.fn();
    render(<TapToPlayButton autoplayBlocked={true} onTap={onTap} />);
    fireEvent.click(screen.getByRole('button', { name: '재생' }));
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  test('44×44 hit-area', () => {
    render(<TapToPlayButton autoplayBlocked={true} onTap={() => {}} />);
    const btn = screen.getByRole('button', { name: '재생' });
    expect(btn.className).toMatch(/\bmin-h-\[44px\]/);
    expect(btn.className).toMatch(/\bmin-w-\[44px\]/);
  });
});
