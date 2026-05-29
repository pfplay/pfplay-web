import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import MusicSearch from './music-search.component';

const useSearchMusicsMock = vi.fn();
vi.mock('@/features/playlist/add-tracks', () => ({
  useSearchMusics: (q: string) => useSearchMusicsMock(q),
}));

describe('MusicSearch', () => {
  test('초기 상태: empty placeholder', () => {
    useSearchMusicsMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('music-search-input')).toBeInTheDocument();
  });

  test('input 변경 → useSearchMusics(query) 호출', async () => {
    useSearchMusicsMock.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'love');
    await waitFor(() =>
      expect(useSearchMusicsMock).toHaveBeenCalledWith(expect.stringContaining('love'))
    );
  });

  test('검색 결과 → 각 곡이 SearchListItem 로 렌더', async () => {
    useSearchMusicsMock.mockReturnValue({
      data: [
        { videoId: 'v1', videoTitle: 'A', thumbnailUrl: '', runningTime: '3:00' },
        { videoId: 'v2', videoTitle: 'B', thumbnailUrl: '', runningTime: '4:00' },
      ],
      isLoading: false,
      error: null,
    });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'x');
    await waitFor(() => {
      expect(screen.getByTestId('search-item-preview-v1')).toBeInTheDocument();
      expect(screen.getByTestId('search-item-preview-v2')).toBeInTheDocument();
    });
  });

  test('error → 실패 메시지 + 재시도 버튼', () => {
    useSearchMusicsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('boom'),
      refetch: vi.fn(),
    });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('music-search-retry')).toBeInTheDocument();
  });

  test('input 채워진 + 빈 결과 → empty state', async () => {
    useSearchMusicsMock.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<MusicSearch onPreview={vi.fn()} onAdd={vi.fn()} addPending={false} />);
    await userEvent.type(screen.getByTestId('music-search-input'), 'xxx');
    await waitFor(() => {
      expect(screen.getByText(/다른 키워드/)).toBeInTheDocument();
    });
  });
});
