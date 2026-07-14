/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// NowPlayingMeta → TrackTitle 이 react-fast-marquee + galmuriFont(next/font/local) 를
// transitive import 한다. next/font/local 은 vitest SSR 에서 함수가 아니라 모듈 로드 시
// throw → 본 스위트가 0 test 로 죽는다. video-title/now-playing-meta 테스트와 동일 패턴으로 mock.
vi.mock('react-fast-marquee', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/foundation/fonts', () => ({ galmuriFont: { className: 'font-galmuri' } }));
// Mode C 의 BlankPlaceholder 가 useI18n 사용 → provider 없는 단위 렌더용 mock.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({ partyroom: { queue: { no_track: '지금 재생 중인 곡이 없어요' } } }),
}));

const youtubePlayerCalls: Array<Record<string, unknown>> = [];
vi.mock('react-player/youtube', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    youtubePlayerCalls.push(props);
    return <div data-testid='youtube-player-mock' data-url={String(props.url ?? '')} />;
  },
}));
vi.mock('next/dynamic', async () => {
  const mod = await import('react-player/youtube');
  return { __esModule: true, default: () => mod.default };
});

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/features/partyroom/get-summary', () => ({
  useFetchPartyroomDetailSummary: () => ({ data: { title: 'Test Room' } }),
}));

vi.mock('@/entities/preference', () => ({
  useUserPreferenceStore: vi.fn((selector: (s: { volume: number; muted: boolean }) => unknown) =>
    selector({ volume: 1, muted: false })
  ),
}));

vi.mock('./ui/parts/action-buttons.component', () => ({
  __esModule: true,
  default: () => <div data-testid='action-buttons-mock' />,
}));

type StoreState = {
  playbackActivated: boolean;
  // PartyroomPlayback 형식 정합: id/thumbnailImage 는 모바일 widget 이 사용 안 하지만,
  // endTime 은 seekToLive 가 getInitialSeek(endTime - now) 으로 사용하므로 필수.
  playback: {
    name: string;
    duration: string;
    linkId: string;
    endTime: number;
    id?: number;
    thumbnailImage?: string;
  } | null;
  currentDj: { crewId: number } | null;
  crews: Array<{ crewId: number; nickname: string }>;
};

// 미래 시각 → getInitialSeek 가 양수 elapsed 반환하지만 mock seekTo 는 호출만 추적.
const FUTURE_END_TIME = Date.now() + 60_000;

let storeState: StoreState = {
  playbackActivated: true,
  playback: { name: 'Track 1', duration: '3:30', linkId: 'abc', endTime: FUTURE_END_TIME },
  currentDj: { crewId: 1 },
  crews: [{ crewId: 1, nickname: 'DJ A' }],
};

// react-player onReady 콜백에 넘기는 mock player.
// seekToLive 가 playerRef.current?.seekTo 를 호출하므로 vi.fn 으로 stub 필요 (회귀 fix #382 invariant).
function makeMockPlayer() {
  return { seekTo: vi.fn() } as unknown;
}

vi.mock('@/shared/lib/store/stores.context', () => ({
  useStores: () => ({
    useCurrentPartyroom: (selector: (s: StoreState) => unknown) => selector(storeState),
  }),
}));

function setStoreState(patch: Partial<StoreState>) {
  storeState = { ...storeState, ...patch };
}
function resetStoreState() {
  storeState = {
    playbackActivated: true,
    playback: { name: 'Track 1', duration: '3:30', linkId: 'abc', endTime: FUTURE_END_TIME },
    currentDj: { crewId: 1 },
    crews: [{ crewId: 1, nickname: 'DJ A' }],
  };
}

import MobilePartyroomDisplayBoard from './partyroom-display-board.component';

beforeEach(() => {
  vi.useFakeTimers();
  youtubePlayerCalls.length = 0;
  mockPush.mockClear();
  resetStoreState();
});
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('MobilePartyroomDisplayBoard · 재생 표시 (ToS 최소 크기, issue #420)', () => {
  test('#1 재생 중 → 전체너비 16:9 영상 + NowPlayingRow + 접기 토글 부재', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const wrapper = screen.getByTestId('video-wrapper');
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    // 축소 썸네일(80×45)·접기 토글 제거 — viewport ≥200×200 유지.
    expect(wrapper.className).not.toContain('w-[80px]');
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
    expect(screen.getByTestId('now-playing-row')).toBeTruthy();
  });

  test('#2 트랙명·DJ 닉네임이 NowPlayingRow 에 표시', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const row = screen.getByTestId('now-playing-row');
    expect(row.textContent).toContain('Track 1');
    expect(screen.getByTestId('now-playing-dj').textContent).toContain('DJ A');
  });
});

describe('MobilePartyroomDisplayBoard · 비재생 (Mode C)', () => {
  test('#3 playback null → BlankPlaceholder + 토글 미렌더 + NowPlayingRow 미렌더 + 영상 미렌더', () => {
    setStoreState({ playbackActivated: false, playback: null });
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /영상/ })).toBeNull();
    expect(screen.queryByTestId('now-playing-row')).toBeNull();
    expect(screen.queryByTestId('youtube-player-mock')).toBeNull();
    // 비재생에도 전체너비 16:9 유지 (축소 금지).
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
  });

  test('#4 비재생 → 재할당 → 전체너비 영상 복귀', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');

    setStoreState({ playbackActivated: false, playback: null });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 4', duration: '1:30', linkId: 'jkl', endTime: FUTURE_END_TIME },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
    expect(screen.getByTestId('video-wrapper').className).toContain('w-full');
  });
});

describe('MobilePartyroomDisplayBoard · compact (크루/큐 탭)', () => {
  test('#5 compact=true → 리액션 숨김 + 영상은 전체너비 유지 (ToS: 축소 안 함)', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} compact />);
    const wrapper = screen.getByTestId('video-wrapper');
    // 관리 탭이라도 영상은 ≥200×200 컴플라이언트 전체너비 — 80×45 축소 금지.
    expect(wrapper.className).toContain('aspect-video');
    expect(wrapper.className).toContain('w-full');
    expect(wrapper.className).not.toContain('w-[80px]');
    // 리액션(채팅 맥락 전용)은 관리 탭에서 숨김.
    expect(screen.queryByTestId('action-buttons-mock')).toBeNull();
  });

  test('#6 compact=false(기본) → 리액션 노출 + 전체너비 영상', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('action-buttons-mock')).toBeTruthy();
    expect(screen.getByTestId('video-wrapper').className).toContain('aspect-video');
  });

  test('#6-1 compact + autoplay 차단 → 영상 위 overlay 단일 게이트만 (별도 TapToPlayButton 중복 없음)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} compact />);
    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (yt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} compact />);

    // 게이트는 영상 위 overlay 하나로 통일 — 과거 Mode B 전용 '재생' TapToPlayButton 은 제거.
    expect(screen.getByTestId('autoplay-gesture-gate')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '재생' })).toBeNull();
  });
});

describe('MobilePartyroomDisplayBoard · autoplay 차단 회귀', () => {
  // #426: 재생 중 곡이 바뀌어도 재-gate 하면 안 된다. 곡 전환은 backend PlaybackStartedEvent 만
  // (DEACTIVATE 없음) → playable 연속 true, played 유지 → player key 불변 → remount 없음 →
  // iOS WebKit user-activation 유지 → 끊김 없이 이어짐. (이전엔 played 리셋→remount→매 곡 재-gate 버그.)
  test('#9 재생 중 트랙 변경 시 재-gate 안 함 (player remount 방지 #426)', () => {
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const firstYt = youtubePlayerCalls[0];
    act(() => {
      (firstYt.onReady as (p: unknown) => void)(makeMockPlayer());
      (firstYt.onPlay as () => void)();
    });

    // 트랙 변경 (재생 중 상태에서 새 곡으로 전환)
    setStoreState({
      playback: { name: 'Track 2', duration: '4:00', linkId: 'def', endTime: FUTURE_END_TIME },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    // played 유지 → 차단 재감지 안 됨 → gesture gate 미표시 (자동재생 끊김 없음)
    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeNull();
  });

  test('#8 Mode C → 재할당 → onReady 후 1500ms 내 onPlay 없으면 차단 + overlay 렌더', () => {
    setStoreState({ playbackActivated: false, playback: null });
    const { rerender } = render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    expect(screen.getByTestId('blank-placeholder')).toBeTruthy();

    setStoreState({
      playbackActivated: true,
      playback: { name: 'Track 5', duration: '3:00', linkId: 'mno', endTime: FUTURE_END_TIME },
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    const yt = youtubePlayerCalls[youtubePlayerCalls.length - 1];
    act(() => {
      (yt.onReady as (p: unknown) => void)(makeMockPlayer());
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    rerender(<MobilePartyroomDisplayBoard partyroomId={1} />);

    expect(screen.queryByTestId('autoplay-gesture-gate')).toBeTruthy();
  });
});

describe('MobilePartyroomDisplayBoard · 헤더', () => {
  test('#9 뒤로 버튼 클릭 시 /parties 라우팅 + PF 아이콘 렌더', () => {
    render(<MobilePartyroomDisplayBoard partyroomId={1} />);
    const back = screen.getByRole('button', { name: '뒤로' });
    expect(back.querySelector('svg')).toBeTruthy(); // PFArrowLeft
    fireEvent.click(back);
    expect(mockPush).toHaveBeenCalledWith('/parties');
    const menu = screen.getByRole('button', { name: '메뉴' });
    expect(menu.querySelector('svg')).toBeTruthy(); // PFMoreVert
  });
});
