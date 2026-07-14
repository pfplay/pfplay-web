import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import MiniPlayer from './mini-player.component';

vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    partyroom: {
      queue: {
        sheet_add_button: '+ 추가',
      },
    },
  }),
}));

const stopPreviewMock = vi.fn();
const useMusicPreviewMock = vi.fn();

beforeEach(() => {
  stopPreviewMock.mockClear();
  useMusicPreviewMock.mockReset();
});

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useMusicPreview: useMusicPreviewMock,
  }),
}));

vi.mock('@/entities/music-preview/index.ui', () => ({
  YouTubePreviewPlayer: (props: { width: number | string; height: number | string }) => (
    <div
      data-testid='yt-player'
      data-width={String(props.width)}
      data-height={String(props.height)}
    />
  ),
}));

describe('MiniPlayer (mobile-bottom)', () => {
  test('currentTrack null 시 미렌더', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: null,
      playState: 'idle',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    const { container } = render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(container.innerHTML).toBe('');
  });

  test('playState idle/paused 도 렌더 (▶ 토글 분기 가능)', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'X', artist: 'Y', source: 'preview-search' },
      playState: 'paused',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('mini-player-toggle-play')).toHaveAttribute(
      'aria-label',
      '미리듣기 재생'
    );
  });

  test('▶ 토글 클릭 시 paused 상태에서 startPreview(currentTrack) 호출', async () => {
    const startPreview = vi.fn();
    const track = { name: 'a', artist: 'b', source: 'preview-search' as const };
    useMusicPreviewMock.mockReturnValue({
      currentTrack: track,
      playState: 'paused',
      startPreview,
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-toggle-play'));
    expect(startPreview).toHaveBeenCalledWith(track);
  });

  test('currentTrack 있음 + playState=playing 시 전체너비 16:9 카드로 렌더 (ToS ≥200×200, issue #420)', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'Song A', artist: 'Artist X', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    const yt = screen.getByTestId('yt-player');
    // 64×36 썸네일은 ToS 위반 → 전체너비(100%) + 높이 ≥200 카드로 교체.
    expect(yt.getAttribute('data-width')).toBe('100%');
    expect(Number(yt.getAttribute('data-height'))).toBeGreaterThanOrEqual(200);
  });

  test('source 무관 렌더 (playlist-track source 도 정상) — spec §B.4', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'X', artist: 'Y', source: 'playlist-track' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('yt-player')).toBeInTheDocument();
  });

  test('⏯ 토글 클릭 시 playing 상태에서 stopPreview 호출', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-toggle-play'));
    expect(stopPreviewMock).toHaveBeenCalledTimes(1);
  });

  test('곡명·아티스트 노출 (ellipsis 영역 분리)', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'Song Title', artist: 'Artist Name', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    expect(screen.getByTestId('mini-player-name')).toHaveTextContent('Song Title');
    expect(screen.getByTestId('mini-player-artist')).toHaveTextContent('Artist Name');
  });

  test('[+ 추가] 클릭 시 onAdd() 호출 (인자 없음 — 추가 대상은 시트가 결정)', async () => {
    const onAdd = vi.fn();
    const track = {
      id: 'v1',
      title: 'A',
      thumbnailUrl: '',
      videoUrl: '',
      source: 'search-result' as const,
    };
    useMusicPreviewMock.mockReturnValue({
      currentTrack: track,
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={onAdd} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-add'));
    // mini-player 의 currentTrack 은 lossy(duration 없음)라 추가 대상이 될 수 없다.
    // 시트가 미리듣은 원본 Music 으로 추가하므로 onAdd 는 인자 없는 시그널.
    expect(onAdd).toHaveBeenCalledWith();
  });

  test('addPending=true 시 [+ 추가] disabled', () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={true} />);
    expect(screen.getByTestId('mini-player-add')).toBeDisabled();
  });

  test('× 클릭 시 stopPreview 호출', async () => {
    useMusicPreviewMock.mockReturnValue({
      currentTrack: { name: 'a', artist: 'b', source: 'preview-search' },
      playState: 'playing',
      startPreview: vi.fn(),
      stopPreview: stopPreviewMock,
    });
    render(<MiniPlayer onAdd={vi.fn()} addPending={false} />);
    await userEvent.click(screen.getByTestId('mini-player-close'));
    expect(stopPreviewMock).toHaveBeenCalledTimes(1);
  });
});
