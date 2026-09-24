import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import DjRegistrationMusicSearch from './dj-registration-music-search.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (query: string) => useSearchMusicsMock(query),
}));

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    playlist: { para: { search_url: 'Search for music and URL' } },
    partyroom: {
      queue: {
        sheet_empty_search: 'Search for a song to DJ',
        sheet_search_failed: 'Search failed',
      },
    },
  }),
}));

describe('DjRegistrationMusicSearch', () => {
  test('검색 결과에서 곡을 선택하면 onSelect(music)을 호출한다', async () => {
    const onSelect = vi.fn();
    const music = {
      videoId: 'v1',
      videoTitle: 'Shut Down',
      thumbnailUrl: 'thumb',
      runningTime: '2:55',
    };
    useSearchMusicsMock.mockReturnValue({ data: [music], isLoading: false, error: null });

    render(<DjRegistrationMusicSearch onSelect={onSelect} />);
    await userEvent.type(screen.getByTestId('register-track-search-input'), 'Shut Down');
    await waitFor(() => expect(screen.getByTestId('register-track-item-v1')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('register-track-item-v1'));

    expect(onSelect).toHaveBeenCalledWith(music);
  });
});
