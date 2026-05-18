vi.mock('@/entities/me', () => ({
  useFetchMe: vi.fn(),
}));
vi.mock('@/features/playlist/list', () => ({
  useFetchPlaylists: vi.fn(),
}));
vi.mock('@/features/playlist/add', () => ({
  useAddPlaylistDialog: vi.fn(),
}));
vi.mock('@/features/playlist/add-tracks', () => ({
  useAddPlaylistTrack: () => ({ mutate: vi.fn() }),
}));
vi.mock('@/features/playlist/edit', () => ({
  useEditPlaylistDialog: vi.fn(),
}));
vi.mock('@/features/playlist/move-track-to-playlist', () => ({
  useMoveTrackToPlaylistDialog: vi.fn(),
}));
vi.mock('@/features/playlist/move-track-to-the-other-playlist', () => ({
  useChangeTrackOrder: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@/features/playlist/remove', () => ({
  useRemovePlaylist: () => ({ mutate: vi.fn() }),
}));
vi.mock('@/features/playlist/remove-track', () => ({
  useRemovePlaylistTrack: () => ({ mutate: vi.fn() }),
}));

import { render } from '@testing-library/react';
import { useFetchMe } from '@/entities/me';
import { useFetchPlaylists } from '@/features/playlist/list';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import PlaylistActionProvider from './playlist-action.provider';

beforeEach(() => {
  vi.clearAllMocks();
  (useFetchPlaylists as Mock).mockReturnValue({ data: [] });
});

describe('PlaylistActionProvider 게스트 게이팅', () => {
  test('게스트(GT)면 useFetchPlaylists를 enabled: false로 호출한다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { authorityTier: AuthorityTier.GT } });

    render(
      <PlaylistActionProvider>
        <div>child</div>
      </PlaylistActionProvider>
    );

    expect(useFetchPlaylists).toHaveBeenCalledWith({ enabled: false });
  });

  test('정회원(FM)이면 useFetchPlaylists를 enabled: true로 호출한다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { authorityTier: AuthorityTier.FM } });

    render(
      <PlaylistActionProvider>
        <div>child</div>
      </PlaylistActionProvider>
    );

    expect(useFetchPlaylists).toHaveBeenCalledWith({ enabled: true });
  });

  test('준회원(AM)이면 useFetchPlaylists를 enabled: true로 호출한다', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { authorityTier: AuthorityTier.AM } });

    render(
      <PlaylistActionProvider>
        <div>child</div>
      </PlaylistActionProvider>
    );

    expect(useFetchPlaylists).toHaveBeenCalledWith({ enabled: true });
  });

  test('me 데이터가 아직 없으면 enabled: false (게스트 안전 기본값)', () => {
    (useFetchMe as Mock).mockReturnValue({ data: undefined });

    render(
      <PlaylistActionProvider>
        <div>child</div>
      </PlaylistActionProvider>
    );

    expect(useFetchPlaylists).toHaveBeenCalledWith({ enabled: false });
  });
});
