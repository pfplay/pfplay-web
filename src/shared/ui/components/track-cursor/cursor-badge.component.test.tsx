import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CursorBadge from './cursor-badge.component';

describe('CursorBadge', () => {
  test('variant=now 면 now testid 로 렌더하고 라벨을 표시한다', () => {
    render(<CursorBadge variant='now' label='NOW' />);
    const badge = screen.getByTestId('track-badge-now');
    expect(badge).toHaveTextContent('NOW');
    expect(screen.queryByTestId('track-badge-next')).not.toBeInTheDocument();
  });

  test('variant=next 면 next testid 로 렌더한다', () => {
    render(<CursorBadge variant='next' label='NEXT' />);
    expect(screen.getByTestId('track-badge-next')).toHaveTextContent('NEXT');
    expect(screen.queryByTestId('track-badge-now')).not.toBeInTheDocument();
  });

  test('now 와 next 의 배경색이 다르다', () => {
    const { unmount } = render(<CursorBadge variant='now' label='NOW' />);
    expect(screen.getByTestId('track-badge-now').className).toContain('bg-red-300');
    unmount();

    render(<CursorBadge variant='next' label='NEXT' />);
    expect(screen.getByTestId('track-badge-next').className).toContain('bg-gray-600');
  });

  test('className 을 덧붙일 수 있다', () => {
    render(<CursorBadge variant='now' label='NOW' className='ml-2' />);
    expect(screen.getByTestId('track-badge-now').className).toContain('ml-2');
  });
});
