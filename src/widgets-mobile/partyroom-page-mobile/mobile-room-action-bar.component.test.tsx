import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import MobileRoomActionBar from './mobile-room-action-bar.component';

vi.mock('@/shared/ui/icons', () => ({
  PFHeadset: (props: Record<string, unknown>) => <svg data-testid='playlist-icon' {...props} />,
  PFDj: (props: Record<string, unknown>) => <svg data-testid='dj-icon' {...props} />,
  PFLink: (props: Record<string, unknown>) => <svg data-testid='share-icon' {...props} />,
}));

vi.mock('@/entities/me/api/use-fetch-me.query', () => ({
  useFetchMe: () => ({ data: { avatarIconUri: '/avatar.png' } }),
}));
vi.mock('@/shared/ui/components/profile/profile.component', () => ({
  default: (props: Record<string, unknown>) => <div data-testid='profile-avatar' {...props} />,
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      menu: { title: '파티룸 바로가기' },
      btn: {
        my_profile: '내 프로필',
        playlist: '플레이리스트',
        share: '공유하기',
      },
    },
    dj: { title: { dj_queue: 'DJ 대기열' } },
  }),
}));

describe('MobileRoomActionBar', () => {
  test('reference navigation actions are rendered', () => {
    render(<MobileRoomActionBar onOpenQueue={vi.fn()} />);

    expect(screen.getByRole('button', { name: '내 프로필' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '플레이리스트' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'DJ 대기열' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '공유하기' })).toBeTruthy();
  });

  test('DJ 대기열 버튼이 Now DJing 진입 콜백을 호출한다', () => {
    const onOpenQueue = vi.fn();
    render(<MobileRoomActionBar onOpenQueue={onOpenQueue} />);

    fireEvent.click(screen.getByRole('button', { name: 'DJ 대기열' }));
    expect(onOpenQueue).toHaveBeenCalledTimes(1);
  });

  test('프로필과 공유 버튼이 각각의 callback을 호출한다', () => {
    const onOpenProfile = vi.fn();
    const onShare = vi.fn();
    render(
      <MobileRoomActionBar onOpenQueue={vi.fn()} onOpenProfile={onOpenProfile} onShare={onShare} />
    );

    fireEvent.click(screen.getByRole('button', { name: '내 프로필' }));
    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    expect(onOpenProfile).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
  });
});
