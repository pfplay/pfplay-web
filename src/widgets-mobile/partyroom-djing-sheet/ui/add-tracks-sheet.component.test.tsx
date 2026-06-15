import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import AddTracksSheet from './add-tracks-sheet.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        sheet_search_placeholder: '곡명 또는 아티스트로 검색',
        sheet_empty_search: '다른 키워드로 시도해보세요',
        sheet_search_failed: '검색에 실패했어요',
        sheet_add_button: '+ 추가',
      },
    },
  }),
}));

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

  test('검색 결과 ▶ 클릭 → startPreview(정식 PreviewTrack: id/videoUrl/source=search-result)', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [{ videoId: 'v1', videoTitle: 'A', thumbnailUrl: 'https://t', runningTime: '3:00' }],
      isLoading: false,
      error: null,
    });
    render(<AddTracksSheet playlistId={42} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => screen.getByTestId('search-item-preview-v1'));
    await userEvent.click(screen.getByTestId('search-item-preview-v1'));
    // 캐스트 우회(`{...music, source:'preview-search'} as unknown`) 제거: preview player 가
    // 요구하는 id/videoUrl 이 채워진 정식 PreviewTrack 으로 매핑(convertSearchMusicToPreview).
    // 이전엔 id/videoUrl 미설정 → youtube-preview-player 가 placeholder 만 띄우고 미재생.
    expect(startPreviewMock).toHaveBeenCalledWith({
      id: 'v1',
      title: 'A',
      thumbnailUrl: 'https://t',
      videoUrl: 'https://www.youtube.com/watch?v=v1',
      source: 'search-result',
    });
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

  test('MiniPlayer [+ 추가] → 미리듣은 Music 의 duration(runningTime) 보존하여 mutate', async () => {
    // PreviewTrack 은 duration 을 안 들고 다닌다(재생 관심사). add 는 duration(필수)이 필요하므로
    // 시트가 미리듣은 원본 Music 을 추적해 그걸로 add → mini-player 의 lossy currentTrack 에 의존 안 함.
    useSearchMusicsMock.mockReturnValue({
      data: [
        { videoId: 'v1', videoTitle: 'A', thumbnailUrl: 'https://thumb', runningTime: '3:00' },
      ],
      isLoading: false,
      error: null,
    });
    useMusicPreviewMock.mockReturnValue({
      // 정식 PreviewTrack(= mini-player 렌더 트리거). duration 없음 — 일부러.
      currentTrack: {
        id: 'v1',
        title: 'A',
        thumbnailUrl: 'https://thumb',
        videoUrl: 'https://www.youtube.com/watch?v=v1',
        source: 'search-result',
      },
      playState: 'playing',
      startPreview: startPreviewMock,
      stopPreview: stopPreviewMock,
    });
    render(<AddTracksSheet playlistId={42} />);
    // 미리듣기 클릭 → 시트가 원본 Music(runningTime 포함) 추적
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => screen.getByTestId('search-item-preview-v1'));
    await userEvent.click(screen.getByTestId('search-item-preview-v1'));
    // mini-player [+ 추가] → 추적된 Music 의 runningTime 이 duration 으로 보존
    await userEvent.click(screen.getByTestId('mini-player-add'));
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
