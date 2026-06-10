/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import QueuePositionSummary from './queue-position-summary.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        my_position: '내 순서 {{position}}번째 · 총 {{total}}명',
        my_turn_now: '지금 내 차례예요',
      },
    },
  }),
}));

describe('QueuePositionSummary', () => {
  test('대기 중 → "내 순서 N번째 · 총 M명" (placeholder 치환)', () => {
    render(<QueuePositionSummary position={3} total={5} isCurrent={false} />);
    expect(screen.getByTestId('queue-position-summary')).toHaveTextContent(
      '내 순서 3번째 · 총 5명'
    );
  });

  test('현재 DJ(isCurrent) → "지금 내 차례예요"', () => {
    render(<QueuePositionSummary position={1} total={4} isCurrent={true} />);
    const el = screen.getByTestId('queue-position-summary');
    expect(el).toHaveTextContent('지금 내 차례예요');
    // 현재 DJ 면 순번/총원 템플릿은 노출하지 않는다
    expect(el).not.toHaveTextContent('내 순서');
  });
});
