import type TReactPlayer from 'react-player';
import { renderHook, act } from '@testing-library/react';
import { RESUME_RECHECK_MS, useAutoResumeOnPause } from './use-auto-resume-on-pause.hook';

const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

function createPlayerRef(internal: unknown) {
  return {
    current: { getInternalPlayer: () => internal } as unknown as TReactPlayer,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('useAutoResumeOnPause', () => {
  test('enabled=false 면 pause 가 와도 playVideo 와 onFallback 둘 다 호출하지 않는다', () => {
    const playVideo = vi.fn();
    const getPlayerState = vi.fn(() => YT_STATE_PAUSED);
    const onFallback = vi.fn();
    const playerRef = createPlayerRef({ playVideo, getPlayerState });

    const { result } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: false, onFallback })
    );

    act(() => {
      result.current();
      vi.advanceTimersByTime(RESUME_RECHECK_MS + 100);
    });

    expect(playVideo).not.toHaveBeenCalled();
    expect(onFallback).not.toHaveBeenCalled();
  });

  test('enabled=true 면 pause 즉시 무인터랙션 playVideo 를 1회 호출한다', () => {
    const playVideo = vi.fn();
    const getPlayerState = vi.fn(() => YT_STATE_PLAYING);
    const onFallback = vi.fn();
    const playerRef = createPlayerRef({ playVideo, getPlayerState });

    const { result } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: true, onFallback })
    );

    act(() => {
      result.current();
    });

    expect(playVideo).toHaveBeenCalledTimes(1);
  });

  test('재확인 시점에 여전히 PAUSED 면(정책 차단) onFallback 으로 폴백한다', () => {
    const playVideo = vi.fn();
    const getPlayerState = vi.fn(() => YT_STATE_PAUSED);
    const onFallback = vi.fn();
    const playerRef = createPlayerRef({ playVideo, getPlayerState });

    const { result } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: true, onFallback })
    );

    act(() => {
      result.current();
      vi.advanceTimersByTime(RESUME_RECHECK_MS);
    });

    expect(onFallback).toHaveBeenCalledTimes(1);
  });

  test('재확인 시점에 재생 중이면(자동 재개 성공) onFallback 을 호출하지 않는다', () => {
    const playVideo = vi.fn();
    const getPlayerState = vi.fn(() => YT_STATE_PLAYING);
    const onFallback = vi.fn();
    const playerRef = createPlayerRef({ playVideo, getPlayerState });

    const { result } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: true, onFallback })
    );

    act(() => {
      result.current();
      vi.advanceTimersByTime(RESUME_RECHECK_MS);
    });

    expect(onFallback).not.toHaveBeenCalled();
  });

  test('언마운트되면 대기 중이던 재확인 타이머가 취소되어 onFallback 을 호출하지 않는다', () => {
    const playVideo = vi.fn();
    const getPlayerState = vi.fn(() => YT_STATE_PAUSED);
    const onFallback = vi.fn();
    const playerRef = createPlayerRef({ playVideo, getPlayerState });

    const { result, unmount } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: true, onFallback })
    );

    act(() => {
      result.current();
    });
    unmount();
    act(() => {
      vi.advanceTimersByTime(RESUME_RECHECK_MS + 100);
    });

    expect(onFallback).not.toHaveBeenCalled();
  });

  test('internal player 가 없어도 throw 하지 않고 onFallback 도 호출하지 않는다', () => {
    const onFallback = vi.fn();
    const playerRef = createPlayerRef(null);

    const { result } = renderHook(() =>
      useAutoResumeOnPause(playerRef, { enabled: true, onFallback })
    );

    expect(() =>
      act(() => {
        result.current();
        vi.advanceTimersByTime(RESUME_RECHECK_MS + 100);
      })
    ).not.toThrow();
    expect(onFallback).not.toHaveBeenCalled();
  });
});
