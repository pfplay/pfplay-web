vi.mock('@/features/partyroom/select-playlist-for-djing', () => ({
  useSelectPlaylistForDjing: vi.fn(),
}));
vi.mock('@/features/playlist/list', () => ({
  useFetchPlaylists: vi.fn(() => ({ data: [] })),
}));
vi.mock('../lib/partyroom-id.context', () => ({
  usePartyroomId: vi.fn(() => 1),
}));
vi.mock('../api/use-change-my-playlist.mutation', () => ({
  useChangeMyPlaylist: vi.fn(),
}));
vi.mock('@/shared/lib/localization/i18n.context');

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSelectPlaylistForDjing } from '@/features/partyroom/select-playlist-for-djing';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import ChangePlaylistButton from './change-playlist-button.component';
import { useChangeMyPlaylist } from '../api/use-change-my-playlist.mutation';

const mockMutate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useChangeMyPlaylist as Mock).mockReturnValue({ mutate: mockMutate });
  (useI18n as Mock).mockReturnValue({ playlist: { btn: { change_playlist: 'Change Playlist' } } });
});

describe('ChangePlaylistButton', () => {
  test('플레이리스트 선택 시 changeMyPlaylist(partyroomId, playlistId) 호출', async () => {
    (useSelectPlaylistForDjing as Mock).mockReturnValue(vi.fn().mockResolvedValue({ id: 42 }));
    render(<ChangePlaylistButton />);
    fireEvent.click(screen.getByTestId('change-playlist-button'));
    await waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith({ partyroomId: 1, playlistId: 42 })
    );
  });

  test('선택 취소(null) 시 mutation 미호출', async () => {
    (useSelectPlaylistForDjing as Mock).mockReturnValue(vi.fn().mockResolvedValue(null));
    render(<ChangePlaylistButton />);
    fireEvent.click(screen.getByTestId('change-playlist-button'));
    await waitFor(() => expect(useSelectPlaylistForDjing).toHaveBeenCalled());
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
