vi.mock('@/shared/lib/localization/i18n.context');
vi.mock('@/shared/lib/localization/renderer/index.ui', () => ({
  Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));
vi.mock('@/shared/ui/icons', () => ({
  PFClose: (props: any) => <svg data-testid='close-icon' {...props} />,
  PFSearch: (props: any) => <svg data-testid='search-icon' {...props} />,
  PFAddPlaylist: (props: any) => <svg data-testid='add-playlist-icon' {...props} />,
}));
vi.mock('./register-button.component', () => ({
  __esModule: true,
  default: () => <button data-testid='register-btn'>Register</button>,
}));
vi.mock('../lib/partyroom-id.context', () => ({
  usePartyroomId: () => 1,
}));

const registerDjWithTrack = vi.fn();
vi.mock('@/features/partyroom/register-dj-with-track', () => ({
  useRegisterDjWithTrack: () => registerDjWithTrack,
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import EmptyBody from './empty-body.component';

beforeEach(() => {
  (useI18n as Mock).mockReturnValue({
    dj: {
      title: { current_dj: 'Current DJ' },
      btn: {
        search_and_register_dj: 'Search a song and be a DJ',
        pick_from_my_playlist: 'Choose from my playlist',
      },
    },
  });
});

describe('EmptyBody', () => {
  test('Current DJ 타이틀을 렌더링한다', () => {
    render(<EmptyBody onCancel={vi.fn()} />);
    expect(screen.getByText('Current DJ')).toBeTruthy();
  });

  test('빈 상태 메시지를 표시한다', () => {
    render(<EmptyBody onCancel={vi.fn()} />);
    expect(screen.getByText('dj.para.no_dj_crew')).toBeTruthy();
  });

  test('RegisterButton을 렌더링한다', () => {
    render(<EmptyBody onCancel={vi.fn()} />);
    expect(screen.getByTestId('register-btn')).toBeTruthy();
  });

  test('곡 검색하고 DJ 등록 클릭 시 검색 등록 플로우를 연다', () => {
    const onCancel = vi.fn();
    render(<EmptyBody onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('search-and-register-dj'));
    expect(registerDjWithTrack).toHaveBeenCalledWith({
      partyroomId: 1,
      closeDjingDialog: onCancel,
    });
  });

  test('닫기 아이콘 클릭 시 onCancel을 호출한다', () => {
    const onCancel = vi.fn();
    render(<EmptyBody onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('close-icon'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
