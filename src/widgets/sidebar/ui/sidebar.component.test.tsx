jest.mock('@/entities/me', () => ({
  useIsGuest: jest.fn(),
  useSuspenseFetchMe: jest.fn(),
}));
jest.mock('@/features/edit-profile-bio', () => ({
  ProfileEditFormV2: () => <div data-testid='profile-edit-form' />,
}));
jest.mock('@/features/sign-in/by-social', () => ({
  useInformSocialType: jest.fn(() => jest.fn()),
}));
jest.mock('@/shared/lib/localization/i18n.context');
jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('@/shared/ui/components/profile/profile.component', () => ({
  __esModule: true,
  default: ({ src, size }: any) => <div data-testid='profile' data-src={src} data-size={size} />,
}));
jest.mock('@/shared/ui/icons', () => ({
  PFHeadset: (props: any) => <svg data-testid='headset-icon' {...props} />,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { useIsGuest, useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import Sidebar from './sidebar.component';

const mockSetPlaylistDrawer = jest.fn();
const mockOpenDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useSuspenseFetchMe as jest.Mock).mockReturnValue({
    data: { avatarIconUri: 'https://example.com/icon.png' },
  });
  (useIsGuest as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(false));
  (useI18n as jest.Mock).mockReturnValue({
    common: { btn: { my_profile: 'My Profile', playlist: 'Playlist' } },
  });
  (useStores as jest.Mock).mockReturnValue({
    useUIState: (selector: (...args: any[]) => any) =>
      selector({ setPlaylistDrawer: mockSetPlaylistDrawer }),
  });
  (useDialog as jest.Mock).mockReturnValue({ openDialog: mockOpenDialog });
});

describe('Sidebar', () => {
  test('프로필 아이콘과 버튼을 렌더링한다', () => {
    render(<Sidebar className='test' onClickAvatarSetting={jest.fn()} />);
    expect(screen.getByTestId('profile')).toBeTruthy();
    expect(screen.getAllByText('My Profile').length).toBeGreaterThan(0);
  });

  test('플레이리스트 버튼을 렌더링한다', () => {
    render(<Sidebar className='test' onClickAvatarSetting={jest.fn()} />);
    expect(screen.getByText('Playlist')).toBeTruthy();
    expect(screen.getByTestId('headset-icon')).toBeTruthy();
  });

  test('플레이리스트 버튼 클릭 시 setPlaylistDrawer를 호출한다', () => {
    render(<Sidebar className='test' onClickAvatarSetting={jest.fn()} />);
    fireEvent.click(screen.getByText('Playlist'));
    expect(mockSetPlaylistDrawer).toHaveBeenCalled();
  });

  test('extraButtons를 렌더링한다', () => {
    const extra = [
      {
        text: 'Extra',
        onClick: jest.fn(),
        icon: () => <svg data-testid='extra-icon' />,
      },
    ];
    render(<Sidebar className='test' onClickAvatarSetting={jest.fn()} extraButtons={extra} />);
    expect(screen.getByText('Extra')).toBeTruthy();
  });
});
