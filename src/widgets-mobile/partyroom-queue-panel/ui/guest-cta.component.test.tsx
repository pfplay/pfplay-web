import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import GuestCta from './guest-cta.component';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('GuestCta', () => {
  test('CTA 텍스트 노출', () => {
    render(<GuestCta />);
    expect(screen.getByTestId('guest-cta')).toBeInTheDocument();
    expect(screen.getByText(/음악을 직접 틀어보세요/)).toBeInTheDocument();
  });

  test('클릭 → router.push(/sign-in)', async () => {
    render(<GuestCta />);
    await userEvent.click(screen.getByTestId('guest-cta'));
    expect(pushMock).toHaveBeenCalledWith('/sign-in');
  });
});
