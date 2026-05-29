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
});
