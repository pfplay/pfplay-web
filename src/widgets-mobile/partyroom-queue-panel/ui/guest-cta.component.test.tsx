import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import GuestCta from './guest-cta.component';

// 데스크탑 PartyroomCreateCard 와 동일 mock 패턴 — informSocialType 함수만 vi.fn 으로 stub.
// 회귀 fix (#383) 이전 mock 은 next/navigation 의 useRouter 였음 (router.push('/sign-in') →
// 룸 unmount + backend exit 의 원인).
const informMock = vi.fn();
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: () => informMock,
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        guest_cta_title: '🎧 음악을 직접 틀어보세요',
        guest_cta_subtitle: '3초만에 가입 →',
      },
    },
  }),
}));

describe('GuestCta', () => {
  test('CTA 텍스트 노출', () => {
    render(<GuestCta />);
    expect(screen.getByTestId('guest-cta')).toBeInTheDocument();
    expect(screen.getByText(/음악을 직접 틀어보세요/)).toBeInTheDocument();
  });

  test('클릭 → informSocialType() 호출 (dialog 표시, 룸 unmount 회피)', async () => {
    render(<GuestCta />);
    await userEvent.click(screen.getByTestId('guest-cta'));
    expect(informMock).toHaveBeenCalledTimes(1);
  });
});
