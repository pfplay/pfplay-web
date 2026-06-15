import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileSelectPlaylist from './use-mobile-select-playlist.hook';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const openManageMock = vi.fn();
vi.mock('@/features-mobile/playlist/manage', () => ({
  useOpenPlaylistsManagement: () => openManageMock,
}));

// useI18n — pass-through mock for the partyroom.queue.* sheet titles
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        sheet_select_playlist_title: '플레이리스트 선택',
        sheet_add_tracks_title: '곡 추가',
      },
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
    openManageMock.mockReset();
  });

  test('playlists=[] → 관리 sheet(openManage) push + router.push 안 함 + resolve(undefined)', async () => {
    const { result } = renderHook(() => useMobileSelectPlaylist({ playlists: [] }), {
      wrapper: wrap,
    });
    const promise = result.current();
    await expect(promise).resolves.toBeUndefined();
    expect(openManageMock).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled(); // /me/playlist 로 안 튕김 (회귀 보정)
  });

  test('every musicCount === 0 → SelectPlaylistSheet push (openManage 안 부름)', async () => {
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
    expect(openManageMock).not.toHaveBeenCalled();
  });

  test.todo(
    '정상 playlists → SelectPlaylistSheet push, 선택 완료 시 resolve(playlist) — Phase 9 통합 테스트로 검증'
  );
});
