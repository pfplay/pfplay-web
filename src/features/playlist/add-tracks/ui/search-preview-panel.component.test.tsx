/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import SearchPreviewPanel from './search-preview-panel.component';

// YouTubePreviewPlayer 는 react-player(dynamic) transitive → 단위 렌더용 mock.
// width/height 를 노출해 ToS 최소 크기(≥200×200, issue #420) 단언.
const previewPlayerCalls: Array<{ width: number; height: number }> = [];
vi.mock('@/entities/music-preview/index.ui', () => ({
  YouTubePreviewPlayer: (props: { width: number; height: number }) => {
    previewPlayerCalls.push({ width: props.width, height: props.height });
    return <div data-testid='yt-preview-player' />;
  },
}));

type PreviewState = {
  currentTrack: { id: string; title: string; source: string } | null;
  playState: 'idle' | 'playing' | 'paused';
  stopPreview: () => void;
};

let previewState: PreviewState = {
  currentTrack: null,
  playState: 'idle',
  stopPreview: vi.fn(),
};

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useMusicPreview: () => previewState,
  }),
}));

function setPreview(patch: Partial<PreviewState>) {
  previewState = { ...previewState, ...patch };
}

afterEach(() => {
  previewPlayerCalls.length = 0;
  previewState = { currentTrack: null, playState: 'idle', stopPreview: vi.fn() };
  vi.clearAllMocks();
});

describe('SearchPreviewPanel', () => {
  test('검색결과 재생 중 → YouTubePreviewPlayer 렌더 + viewport ≥200×200 (ToS, issue #420)', () => {
    setPreview({
      currentTrack: { id: 'abc', title: 'T', source: 'search-result' },
      playState: 'playing',
    });
    render(<SearchPreviewPanel />);
    expect(screen.getByTestId('yt-preview-player')).toBeTruthy();
    expect(previewPlayerCalls).toHaveLength(1);
    expect(previewPlayerCalls[0].width).toBeGreaterThanOrEqual(200);
    expect(previewPlayerCalls[0].height).toBeGreaterThanOrEqual(200);
    expect(screen.queryByTestId('search-preview-placeholder')).toBeNull();
  });

  test('idle(미리듣기 없음) → placeholder 표시 + 플레이어 미렌더', () => {
    render(<SearchPreviewPanel />);
    expect(screen.getByTestId('search-preview-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('yt-preview-player')).toBeNull();
  });

  test('플레이리스트 트랙 소스는 검색 패널에서 미렌더 (sidebar 책임) → placeholder', () => {
    setPreview({
      currentTrack: { id: 'abc', title: 'T', source: 'playlist-track' },
      playState: 'playing',
    });
    render(<SearchPreviewPanel />);
    expect(screen.getByTestId('search-preview-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('yt-preview-player')).toBeNull();
  });

  test('검색결과지만 paused 면 placeholder (playing 일 때만 플레이어)', () => {
    setPreview({
      currentTrack: { id: 'abc', title: 'T', source: 'search-result' },
      playState: 'paused',
    });
    render(<SearchPreviewPanel />);
    expect(screen.getByTestId('search-preview-placeholder')).toBeTruthy();
    expect(screen.queryByTestId('yt-preview-player')).toBeNull();
  });
});
