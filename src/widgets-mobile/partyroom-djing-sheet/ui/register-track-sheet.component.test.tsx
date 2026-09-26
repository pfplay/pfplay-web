import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import RegisterTrackSheet from './register-track-sheet.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (query: string) => useSearchMusicsMock(query),
}));

const mutateMock = vi.fn();
const useQuickRegisterMock = vi.fn(() => ({ mutate: mutateMock, isPending: false }));
vi.mock(
  '@/features/partyroom/register-dj-with-track/api/use-quick-register-me-to-queue.mutation',
  () => ({
    useQuickRegisterMeToQueue: () => useQuickRegisterMock(),
  })
);

const closeAllMock = vi.fn();
vi.mock('../lib/use-fullscreen-sheet.hook', () => ({
  useFullscreenSheet: () => ({ closeAll: closeAllMock }),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        sheet_search_placeholder: 'Search for music and URL',
        sheet_empty_search: 'Search for a song to DJ',
        sheet_search_failed: 'Search failed',
      },
    },
    playlist: {
      para: { search_url: 'Search for music and URL' },
    },
    dj: {
      para: { search_song_to_dj: 'Search for a song to DJ' },
      btn: { register_with_this_song: 'Register as DJ with this song' },
    },
  }),
}));

describe('RegisterTrackSheet', () => {
  test('검색 결과를 선택하면 CTA가 활성화된다', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [
        { videoId: 'v1', videoTitle: 'Shut Down', thumbnailUrl: 'thumb', runningTime: '2:55' },
      ],
      isLoading: false,
      error: null,
    });

    render(<RegisterTrackSheet partyroomId={42} />);
    await userEvent.type(screen.getByTestId('register-track-search-input'), 'Shut Down');
    await userEvent.click(screen.getByTestId('register-track-item-v1'));

    expect(screen.getByTestId('register-track-submit')).not.toBeDisabled();
  });

  test('선택한 곡으로 quick register 후 시트를 닫는다', async () => {
    const music = {
      videoId: 'v1',
      videoTitle: 'Shut Down',
      thumbnailUrl: 'thumb',
      runningTime: '2:55',
    };
    useSearchMusicsMock.mockReturnValue({ data: [music], isLoading: false, error: null });
    const mutate = vi.fn((_payload, options?: { onSuccess?: () => void }) =>
      options?.onSuccess?.()
    );
    useQuickRegisterMock.mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<RegisterTrackSheet partyroomId={42} />);
    await userEvent.type(screen.getByTestId('register-track-search-input'), 'Shut Down');
    await userEvent.click(screen.getByTestId('register-track-item-v1'));
    await userEvent.click(screen.getByTestId('register-track-submit'));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        {
          partyroomId: 42,
          name: 'Shut Down',
          linkId: 'v1',
          duration: '2:55',
          thumbnailImage: 'thumb',
        },
        expect.any(Object)
      );
      expect(closeAllMock).toHaveBeenCalledTimes(1);
    });
  });
});
