vi.mock('@/entities/me', () => ({
  useIsGuest: vi.fn(),
}));
vi.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: vi.fn(() => vi.fn()),
}));
vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('./form.component', () => ({
  __esModule: true,
  default: vi.fn(),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useIsGuest } from '@/entities/me';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import EntryButton from './entry-button.component';
import useAddPlaylistDialog from './form.component';

const mockOpenAddDialog = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAddPlaylistDialog as Mock).mockReturnValue(mockOpenAddDialog);
  (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(false));
  (useI18n as Mock).mockReturnValue({ playlist: { btn: { add_list: 'Add List' } } });
});

describe('EntryButton', () => {
  test('멤버가 클릭하면 플레이리스트 생성 다이얼로그를 연다', async () => {
    render(<EntryButton />);
    fireEvent.click(screen.getByTestId('add-playlist-button'));
    await waitFor(() => expect(mockOpenAddDialog).toHaveBeenCalled());
  });

  test('게스트가 클릭하면 소셜 모달 유도 + 다이얼로그 미오픈', async () => {
    const mockInform = vi.fn();
    (useInformSocialType as Mock).mockReturnValue(mockInform);
    (useIsGuest as Mock).mockReturnValue(vi.fn().mockResolvedValue(true));
    render(<EntryButton />);
    fireEvent.click(screen.getByTestId('add-playlist-button'));
    await waitFor(() => expect(mockInform).toHaveBeenCalled());
    expect(mockOpenAddDialog).not.toHaveBeenCalled();
  });
});
