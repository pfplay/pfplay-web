/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ExpandToggle from './expand-toggle.component';

describe('ExpandToggle', () => {
  test('expanded=true 시 aria-label="영상 가리기" + aria-pressed="false" (spec §6.2)', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('영상 가리기');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  test('expanded=false 시 aria-label="영상 펼치기" + aria-pressed="true"', () => {
    render(<ExpandToggle expanded={false} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('영상 펼치기');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  test('클릭 시 onToggle 콜백 1회 호출', () => {
    const onToggle = vi.fn();
    render(<ExpandToggle expanded={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('44×44 hit-area class — min-h-[44px] + min-w-[44px] (iOS HIG, spec §6.2)', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.className).toMatch(/\bmin-h-\[44px\]/);
    expect(btn.className).toMatch(/\bmin-w-\[44px\]/);
  });

  test('positioning 책임은 parent (VideoFrame) — leaf 본문은 absolute/top-*/right-* 미보유', () => {
    render(<ExpandToggle expanded={true} onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn.className).not.toMatch(/\babsolute\b/);
    expect(btn.className).not.toMatch(/\btop-/);
    expect(btn.className).not.toMatch(/\bright-/);
  });
});
