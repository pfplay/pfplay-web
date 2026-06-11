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
      },
    },
  }),
}));

describe('QueuePositionSummary', () => {
  test('대기 중 → "내 순서 N번째 · 총 M명" (placeholder 치환)', () => {
    render(<QueuePositionSummary position={3} total={5} />);
    expect(screen.getByTestId('queue-position-summary')).toHaveTextContent(
      '내 순서 3번째 · 총 5명'
    );
  });
});
