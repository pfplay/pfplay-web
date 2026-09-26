/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import BlankPlaceholder from './blank-placeholder.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        no_track: '지금 재생 중인 곡이 없어요',
        empty_cta: 'Start playing from the <b>DJ queue</b> now!',
      },
    },
  }),
}));

describe('BlankPlaceholder', () => {
  test('inline 한국어 안내 텍스트 렌더 (spec §6.3, §3 row 11)', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByText('지금 재생 중인 곡이 없어요')).toBeTruthy();
  });

  test('data-testid="blank-placeholder" 단언', () => {
    render(<BlankPlaceholder />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
  });

  test('PFPlay 로고 없이 번역된 DJ 대기열 안내만 표시한다', () => {
    render(<BlankPlaceholder />);

    expect(screen.queryByAltText('PFPlay')).toBeNull();
    expect(screen.getByText('DJ queue').tagName).toBe('B');
  });
});
