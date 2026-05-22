vi.mock('@/entities/me', () => ({
  useIsGuest: vi.fn(),
}));
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: vi.fn(() => vi.fn()),
}));
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/lib/localization/lang.context', () => ({
  useLang: vi.fn(() => 'ko'),
}));
vi.mock('@/shared/ui/components/dialog');
vi.mock('./form.component', () => ({
  __esModule: true,
  default: () => <div data-testid='create-form' />,
}));
vi.mock('next/image', () => ({ __esModule: true, default: () => <img alt='' /> }));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useIsGuest } from '@/entities/me';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';
import PartyroomCreateCard from './card.component';

const mockOpenDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(false));
  (useI18n as Mock).mockReturnValue({
    lobby: { title: { be_a_host: 'Be a Host' }, para: { freely_host: 'Freely host' } },
    createparty: { title: { create_party: 'Create' }, para: { cancel_confirm: 'a\nb' } },
  });
  (useDialog as Mock).mockReturnValue({ openDialog: mockOpenDialog, openConfirmDialog: vi.fn() });
});

describe('PartyroomCreateCard', () => {
  test('멤버(AM/FM)가 클릭하면 파티룸 생성 다이얼로그를 연다 (지갑 게이트 없음)', async () => {
    render(<PartyroomCreateCard />);
    fireEvent.click(screen.getByTestId('create-partyroom-button'));
    await waitFor(() => expect(mockOpenDialog).toHaveBeenCalled());
  });

  test('게스트가 클릭하면 소셜 모달 유도 + 다이얼로그 미오픈', async () => {
    const mockInform = vi.fn();
    (useInformSocialType as Mock).mockReturnValue(mockInform);
    (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    render(<PartyroomCreateCard />);
    fireEvent.click(screen.getByTestId('create-partyroom-button'));
    await waitFor(() => expect(mockInform).toHaveBeenCalled());
    expect(mockOpenDialog).not.toHaveBeenCalled();
  });
});
