import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import PlayingBars from './playing-bars.component';

describe('PlayingBars', () => {
  test('막대 4개를 렌더한다', () => {
    render(<PlayingBars />);
    expect(screen.getByTestId('playing-bars').children).toHaveLength(4);
  });

  test('스크린리더에서 감춘다 — 상태는 배지 텍스트가 전달한다', () => {
    render(<PlayingBars />);
    expect(screen.getByTestId('playing-bars')).toHaveAttribute('aria-hidden', 'true');
  });

  test('각 막대의 애니메이션 지연이 서로 달라 파형이 어긋난다', () => {
    render(<PlayingBars />);
    const delays = Array.from(screen.getByTestId('playing-bars').children).map(
      (bar) => (bar as HTMLElement).style.animationDelay
    );
    expect(new Set(delays).size).toBe(4);
  });

  test('reduced-motion 에서 애니메이션이 꺼지도록 motion-reduce 유틸을 단다', () => {
    render(<PlayingBars />);
    const firstBar = screen.getByTestId('playing-bars').children[0] as HTMLElement;
    expect(firstBar.className).toContain('motion-reduce:animate-none');
  });
});
