import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import AddTracksSheet from './add-tracks-sheet.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (q: string) => useSearchMusicsMock(q),
}));

const addMutateMock = vi.fn();
const useAddPlaylistTrackMock = vi.fn(() => ({
  mutate: addMutateMock,
  isPending: false,
}));
vi.mock('@/features/playlist/add-tracks/api/use-add-playlist-track.mutation', () => ({
  useAddPlaylistTrack: () => useAddPlaylistTrackMock(),
}));

const startPreviewMock = vi.fn();
const stopPreviewMock = vi.fn();
const useMusicPreviewMock = vi.fn(() => ({
  currentTrack: null,
  playState: 'idle',
  startPreview: startPreviewMock,
  stopPreview: stopPreviewMock,
}));
vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({ useMusicPreview: useMusicPreviewMock }),
}));

vi.mock('@/entities/music-preview/index.ui', () => ({
  YouTubePreviewPlayer: () => <div data-testid='yt-player' />,
}));

describe('AddTracksSheet', () => {
  test('MusicSearch 가 sheet body 로 렌더', () => {
    useSearchMusicsMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AddTracksSheet playlistId={42} />);
    expect(screen.getByTestId('music-search-input')).toBeInTheDocument();
  });

  test('검색 결과 ▶ 클릭 → startPreview(music + source preview-search) 호출', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [{ videoId: 'v1', videoTitle: 'A', thumbnailUrl: '', runningTime: '3:00' }],
      isLoading: false,
      error: null,
    });
    render(<AddTracksSheet playlistId={42} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => screen.getByTestId('search-item-preview-v1'));
    await userEvent.click(screen.getByTestId('search-item-preview-v1'));
    expect(startPreviewMock).toHaveBeenCalledWith(
      expect.objectContaining({ videoId: 'v1', source: 'preview-search' })
    );
  });

  test('currentTrack 있음 시 MiniPlayer (footer) 노출', () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { videoId: 'v1', videoTitle: 'A', source: 'preview-search' },
      playState: 'playing',
      startPreview: startPreviewMock,
      stopPreview: stopPreviewMock,
    });
    render(<AddTracksSheet playlistId={42} />);
    expect(screen.getByTestId('mini-player-name')).toBeInTheDocument();
  });

  test('MiniPlayer [+ 추가] → useAddPlaylistTrack.mutate({ listId, linkId, name, duration, thumbnailImage })', async () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    useMusicPreviewMock.mockReturnValue({
      currentTrack: {
        videoId: 'v1',
        videoTitle: 'A',
        thumbnailUrl: 'https://thumb',
        runningTime: '3:00',
        source: 'preview-search',
      },
      playState: 'playing',
      startPreview: startPreviewMock,
      stopPreview: stopPreviewMock,
    });
    render(<AddTracksSheet playlistId={42} />);
    await userEvent.click(screen.getByTestId('mini-player-add'));
    // 실제 mutation 시그니처: { listId, linkId, name, duration, thumbnailImage }
    // playlistId(props) → listId, Music{videoId,videoTitle,thumbnailUrl,runningTime} → {linkId,name,thumbnailImage,duration}
    expect(addMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 42,
        linkId: 'v1',
        name: 'A',
        duration: '3:00',
        thumbnailImage: 'https://thumb',
      })
    );
  });

  test('검색결과 [+] 직접 클릭 → mutate (preview 없이도 추가)', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [{ videoId: 'v2', videoTitle: 'B', thumbnailUrl: 'https://t2', runningTime: '2:30' }],
      isLoading: false,
      error: null,
    });
    render(<AddTracksSheet playlistId={7} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'q');
    await waitFor(() => screen.getByTestId('search-item-add-v2'));
    await userEvent.click(screen.getByTestId('search-item-add-v2'));
    expect(addMutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        listId: 7,
        linkId: 'v2',
        name: 'B',
        duration: '2:30',
        thumbnailImage: 'https://t2',
      })
    );
  });
});
