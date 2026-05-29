import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileSelectPlaylist from './use-mobile-select-playlist.hook';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const confirmMock = vi.fn();
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({
    openConfirmDialog: (...args: unknown[]) => confirmMock(...args),
  }),
}));

// useI18n — pass-through mock for the create_playlist_song key
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    dj: {
      para: { create_playlist_song: '곡을 추가해주세요' },
    },
  }),
}));

const PL_ALL_EMPTY = [{ id: 1, name: 'A', musicCount: 0 }];

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

describe('useMobileSelectPlaylist', () => {
  beforeEach(() => {
    pushMock.mockReset();
    confirmMock.mockReset();
  });

  test('playlists=[] → confirm dialog → confirm 시 /me/playlist push + resolve(undefined)', async () => {
    confirmMock.mockResolvedValue(true);
    const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
      wrapper: wrap,
    });
    const promise = result.current();
    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    await expect(promise).resolves.toBeUndefined();
    expect(pushMock).toHaveBeenCalledWith('/me/playlist');
  });

  test('playlists=[] + confirm 취소 시 push 없음 + resolve(undefined)', async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
      wrapper: wrap,
    });
    const promise = result.current();
    await expect(promise).resolves.toBeUndefined();
    expect(pushMock).not.toHaveBeenCalled();
  });

  test('every musicCount === 0 → SelectPlaylistSheet push (confirm dialog 안 띄움)', async () => {
    const { result } = renderHook(
      () => useMobileSelectPlaylist({ playlists: PL_ALL_EMPTY as never }),
      {
        wrapper: wrap,
      }
    );
    await act(async () => {
      void result.current();
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(confirmMock).not.toHaveBeenCalled();
  });

  test.todo(
    '정상 playlists → SelectPlaylistSheet push, 선택 완료 시 resolve(playlist) — Phase 9 통합 테스트로 검증'
  );
});
