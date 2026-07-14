/**
 * @vitest-environment jsdom
 */
import { useRef } from 'react';
import type TReactPlayer from 'react-player';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import useAutoplayGestureGate, { AUTOPLAY_DETECT_MS } from './use-autoplay-gesture-gate.hook';

function setupHook({
  playable = true,
  videoId = 'abc' as string | null,
}: { playable?: boolean; videoId?: string | null } = {}) {
  return renderHook(() => {
    const playerRef = useRef<TReactPlayer | null>(null);
    return useAutoplayGestureGate({ playerRef, playable, videoId });
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useAutoplayGestureGate', () => {
  test('AUTOPLAY_DETECT_MS = 1500 (spec §4.6, ms)', () => {
    expect(AUTOPLAY_DETECT_MS).toBe(1500);
  });

  test('초기 state: autoplayBlocked / played / playerReady 모두 false', () => {
    const { result } = setupHook();
    expect(result.current.autoplayBlocked).toBe(false);
    expect(result.current.played).toBe(false);
    expect(result.current.playerReady).toBe(false);
  });

  test('onReady 호출 시 playerReady=true 로 전이', () => {
    const { result } = setupHook();
    const fakePlayer = {} as TReactPlayer;
    act(() => result.current.onReady(fakePlayer));
    expect(result.current.playerReady).toBe(true);
  });

  test('onReady 후 1500ms 내 onPlay 없으면 autoplayBlocked=true', () => {
    const { result } = setupHook();
    act(() => result.current.onReady({} as TReactPlayer));
    act(() => {
      vi.advanceTimersByTime(AUTOPLAY_DETECT_MS);
    });
    expect(result.current.autoplayBlocked).toBe(true);
  });

  test('onPlay 호출 시 played=true + autoplayBlocked=false', () => {
    const { result } = setupHook();
    act(() => result.current.onReady({} as TReactPlayer));
    act(() => {
      vi.advanceTimersByTime(AUTOPLAY_DETECT_MS);
    });
    expect(result.current.autoplayBlocked).toBe(true);
    act(() => result.current.onPlay());
    expect(result.current.played).toBe(true);
    expect(result.current.autoplayBlocked).toBe(false);
  });

  test('handleGesturePlay 가 internal playVideo() 호출 + autoplayBlocked=false 즉시 전환', () => {
    const playVideo = vi.fn();
    const fakePlayer = {
      getInternalPlayer: () => ({ playVideo }),
    } as unknown as TReactPlayer;

    const { result } = renderHook(() => {
      const playerRef = useRef<TReactPlayer | null>(fakePlayer);
      return {
        gate: useAutoplayGestureGate({ playerRef, playable: true, videoId: 'abc' }),
        playerRef,
      };
    });

    act(() => result.current.gate.onReady(fakePlayer));
    act(() => vi.advanceTimersByTime(AUTOPLAY_DETECT_MS));
    expect(result.current.gate.autoplayBlocked).toBe(true);

    act(() => result.current.gate.handleGesturePlay());
    expect(playVideo).toHaveBeenCalledTimes(1);
    expect(result.current.gate.autoplayBlocked).toBe(false);
  });

  // #426: 이전엔 videoId 변경 시 played=false 로 리셋했고, video-frame 의 key 가 played 를
  // 포함해 곡 전환마다 IFrame 이 remount → iOS WebKit 에서 user-activation 소실 → 매 곡 재-gate.
  // 곡 전환은 백엔드가 PlaybackStartedEvent 만 보내(DEACTIVATE 없음) playable 이 연속 true 이므로,
  // played 를 유지해야 key 가 불변 → remount 없음 → 첫 탭 이후 곡 전환이 끊김 없이 이어진다.
  // (데스크톱 video.component 와 동일한 안정-인스턴스 정책.)
  test('videoId 변경 시 played 유지 — 재생 중이면 재-gate 안 함 (트랙 전환 remount 방지 #426)', () => {
    let id = 'first' as string | null;
    const { result, rerender } = renderHook(() => {
      const playerRef = useRef<TReactPlayer | null>(null);
      return useAutoplayGestureGate({ playerRef, playable: true, videoId: id });
    });

    act(() => result.current.onReady({} as TReactPlayer));
    act(() => result.current.onPlay());
    expect(result.current.played).toBe(true);
    expect(result.current.autoplayBlocked).toBe(false);

    id = 'second';
    rerender();

    // 재생 중이던 player 는 곡 전환에 played 유지 → key 불변 → remount 없음
    expect(result.current.played).toBe(true);

    // 이미 재생 중이므로 차단 재감지(재-gate) 하지 않는다
    act(() => vi.advanceTimersByTime(AUTOPLAY_DETECT_MS));
    expect(result.current.autoplayBlocked).toBe(false);
  });

  test('첫 곡이 아직 재생 전(played=false)일 때 videoId 변경되면 차단 감지는 계속 동작', () => {
    // 첫 곡을 한 번도 재생 못 한 상태에서 트랙이 바뀌면 여전히 gate 로 탭 유도해야 한다.
    let id = 'first' as string | null;
    const { result, rerender } = renderHook(() => {
      const playerRef = useRef<TReactPlayer | null>(null);
      return useAutoplayGestureGate({ playerRef, playable: true, videoId: id });
    });

    act(() => result.current.onReady({} as TReactPlayer));
    expect(result.current.played).toBe(false);

    id = 'second';
    rerender();

    expect(result.current.played).toBe(false);
    act(() => vi.advanceTimersByTime(AUTOPLAY_DETECT_MS));
    expect(result.current.autoplayBlocked).toBe(true);
  });

  test('playable=false 진입 시 모든 state reset (Mode C 진입 시 cleanup)', () => {
    let playable = true;
    const { result, rerender } = renderHook(() => {
      const playerRef = useRef<TReactPlayer | null>(null);
      return useAutoplayGestureGate({ playerRef, playable, videoId: 'abc' });
    });

    act(() => result.current.onReady({} as TReactPlayer));
    act(() => result.current.onPlay());
    expect(result.current.playerReady).toBe(true);
    expect(result.current.played).toBe(true);

    playable = false;
    rerender();

    expect(result.current.playerReady).toBe(false);
    expect(result.current.played).toBe(false);
    expect(result.current.autoplayBlocked).toBe(false);
  });
});
