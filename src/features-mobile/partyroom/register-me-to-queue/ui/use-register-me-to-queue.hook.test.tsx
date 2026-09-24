import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { FullscreenSheetProvider } from '@/widgets-mobile/partyroom-djing-sheet';
import useMobileRegisterMeToQueue from './use-register-me-to-queue.hook';

const openAlertMock = vi.fn();
vi.mock('@/shared/ui/components/dialog', () => ({
  useDialog: () => ({ openAlertDialog: openAlertMock, openConfirmDialog: vi.fn() }),
}));

const registerMutate = vi.fn();
vi.mock('@/features/partyroom/register-me-to-queue', () => ({
  useRegisterMeToQueue: () => ({ mutate: registerMutate, isPending: false }),
}));

const selectPlaylistMock = vi.fn();
vi.mock('@/features-mobile/partyroom/select-playlist-for-djing', () => ({
  useMobileSelectPlaylist: () => selectPlaylistMock,
}));

const openDjingGuideMock = vi.fn();
vi.mock('@/features-mobile/playlist/djing-guide', () => ({
  useMobileDjingGuide: () => ({ showDjingGuide: true, openDjingGuideModal: openDjingGuideMock }),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    dj: { para: { locked_queue_by_admin: 'queue locked' } },
  }),
}));

const wrap = ({ children }: { children: ReactNode }) => (
  <FullscreenSheetProvider>{children}</FullscreenSheetProvider>
);

beforeEach(() => {
  openAlertMock.mockReset();
  registerMutate.mockReset();
  registerMutate.mockImplementation((_payload: unknown, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.()
  );
  selectPlaylistMock.mockReset();
  openDjingGuideMock.mockReset();
});

describe('useMobileRegisterMeToQueue', () => {
  test('큐 락(CLOSE) 시 alert dialog + mutation 미호출', async () => {
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.CLOSE,
          playlists: [],
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(openAlertMock).toHaveBeenCalled();
    expect(registerMutate).not.toHaveBeenCalled();
  });

  test('selectPlaylist 취소 시 mutation 미호출', async () => {
    selectPlaylistMock.mockResolvedValue(undefined);
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.OPEN,
          playlists: [{ id: 1, name: 'A', musicCount: 5 }] as never,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(registerMutate).not.toHaveBeenCalled();
  });

  test('정상 → 등록 성공 callback + showDjingGuide=true 시 후속 동작 실행', async () => {
    selectPlaylistMock.mockResolvedValue({ id: 10, name: 'p', musicCount: 5 });
    const onRegistered = vi.fn();
    const { result } = renderHook(
      () =>
        useMobileRegisterMeToQueue({
          partyroomId: 1,
          queueStatus: QueueStatus.OPEN,
          playlists: [{ id: 10, name: 'p', musicCount: 5 }] as never,
          onRegistered,
        }),
      { wrapper: wrap }
    );
    await act(async () => {
      await result.current();
    });
    expect(registerMutate).toHaveBeenCalledWith(
      { partyroomId: 1, playlistId: 10 },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onRegistered).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(openDjingGuideMock).toHaveBeenCalled());
  });
});
