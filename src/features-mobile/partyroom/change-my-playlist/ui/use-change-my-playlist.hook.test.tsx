import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileChangeMyPlaylist from './use-change-my-playlist.hook';

const changeMutate = vi.fn();
vi.mock('@/features/partyroom/change-my-playlist', () => ({
  useChangeMyPlaylist: () => ({ mutate: changeMutate, isPending: false }),
}));

const selectPlaylistMock = vi.fn();
vi.mock('@/features-mobile/partyroom/select-playlist-for-djing', () => ({
  useMobileSelectPlaylist: () => selectPlaylistMock,
}));

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileChangeMyPlaylist', () => {
  test('selectPlaylist 취소 시 mutation 미호출', async () => {
    selectPlaylistMock.mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useMobileChangeMyPlaylist({
          partyroomId: 1,
          playlists: [{ id: 1, name: 'A', musicCount: 5 }] as never,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(changeMutate).not.toHaveBeenCalled();
  });

  test('정상 → changeMutate({partyroomId, playlistId})', async () => {
    selectPlaylistMock.mockResolvedValue({ id: 99, name: 'p', musicCount: 5 });
    const { result } = renderHook(
      () =>
        useMobileChangeMyPlaylist({
          partyroomId: 1,
          playlists: [{ id: 99, name: 'p', musicCount: 5 }] as never,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(changeMutate).toHaveBeenCalledWith({ partyroomId: 1, playlistId: 99 });
  });
});
