import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import GuideLayout from './guide-layout.component';

describe('GuideLayout (모바일 stacking)', () => {
  test('규칙 카드 + [다시 보지 않기] + [시작] 버튼 노출', () => {
    render(<GuideLayout onClose={vi.fn()} onDismissPermanent={vi.fn()} />);
    expect(screen.getByTestId('guide-start')).toHaveTextContent('시작');
    expect(screen.getByTestId('guide-dismiss-permanent')).toBeInTheDocument();
  });

  test('[시작] 클릭 → onClose', async () => {
    const onClose = vi.fn();
    render(<GuideLayout onClose={onClose} onDismissPermanent={vi.fn()} />);
    await userEvent.click(screen.getByTestId('guide-start'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('[다시 보지 않기] 체크 + [시작] → onDismissPermanent + onClose', async () => {
    const onClose = vi.fn();
    const onDismissPermanent = vi.fn();
    render(<GuideLayout onClose={onClose} onDismissPermanent={onDismissPermanent} />);
    await userEvent.click(screen.getByTestId('guide-dismiss-permanent'));
    await userEvent.click(screen.getByTestId('guide-start'));
    expect(onDismissPermanent).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
