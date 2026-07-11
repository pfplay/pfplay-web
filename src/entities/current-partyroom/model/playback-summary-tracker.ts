import { parseDurationToSeconds } from '@/shared/lib/functions/parse-duration';

export const SKIP_TOLERANCE_MS = 5_000;

export type SummaryCounts = { like: number; dislike: number; grab: number };

export type PlaybackSummary = {
  trackName: string;
  djNickname: string | null;
  counts: SummaryCounts;
  skipped: boolean;
};

type Snapshot = {
  trackName: string;
  djNickname: string | null;
  counts: SummaryCounts;
  /** null = duration 파싱 실패 → 스킵 판정 불가(fail-safe로 완주 취급, 세칙 L7) */
  expectedEndAtLocal: number | null;
  trackIdentity: string;
};

const ZERO: SummaryCounts = { like: 0, dislike: 0, grab: 0 };

/**
 * 곡 종료 요약 구획용 hold-and-clear 스냅샷 추적기 (스펙 §4).
 * - 스토어 리셋 타이밍과 무관하게 counts를 자체 보유한다.
 * - 방출은 스냅샷을 소비(clear)하므로 이중 DEACTIVATE에도 구획은 1회다.
 * - 순수 모듈: 시각은 전부 인자로 받는다(테스트 결정성).
 */
export function createPlaybackSummaryTracker() {
  let snapshot: Snapshot | null = null;
  let lastStartEventId: string | null = null;

  const toSummary = (s: Snapshot, now: number): PlaybackSummary => ({
    trackName: s.trackName,
    djNickname: s.djNickname,
    counts: s.counts,
    skipped: s.expectedEndAtLocal !== null && now < s.expectedEndAtLocal - SKIP_TOLERANCE_MS,
  });

  return {
    /** 시드① — PLAYBACK_STARTED. 이전 스냅샷이 있으면 요약을 반환(방출)하고 새 스냅샷으로 교체. L5: 동일 eventId 재전달은 완전 무시(null). */
    seedFromStart(input: {
      eventId: string;
      trackName: string;
      trackIdentity: string;
      djNickname: string | null;
      durationText: string;
      now: number;
    }): PlaybackSummary | null {
      if (input.eventId === lastStartEventId) return null;
      lastStartEventId = input.eventId;

      const emitted = snapshot ? toSummary(snapshot, input.now) : null;
      const seconds = parseDurationToSeconds(input.durationText);
      snapshot = {
        trackName: input.trackName,
        djNickname: input.djNickname,
        counts: ZERO,
        expectedEndAtLocal: seconds === null ? null : input.now + seconds * 1_000,
        trackIdentity: input.trackIdentity,
      };
      return emitted;
    },

    /** 시드② — setup 하이드레이션. L3(동일 identity=counts만 덮음)·L4(stale 무시)·불일치 폐기·playback 없음=clear. 방출하지 않는다. */
    seedFromSetup(input: {
      playback: { name: string; linkId: string; endTime: number } | undefined;
      counts: SummaryCounts | undefined;
      djNickname: string | null;
      now: number;
    }): void {
      if (!input.playback) {
        snapshot = null;
        return;
      }
      if (input.playback.endTime <= input.now) return; // L4: stale setup 무시

      if (snapshot && snapshot.trackIdentity === input.playback.linkId) {
        // L3: 서버가 권위 — counts만 보정, 로컬 expectedEnd 추정은 유지(skew 노출 endTime으로 덮지 않음)
        if (input.counts) snapshot = { ...snapshot, counts: input.counts };
        return;
      }
      // 불일치(또는 빈 상태): 놓친 경계는 기념하지 않음 — 방출 없이 교체
      snapshot = {
        trackName: input.playback.name,
        djNickname: input.djNickname,
        counts: input.counts ?? ZERO,
        expectedEndAtLocal: input.playback.endTime, // 시드②만 서버 epoch(5s 여유로 skew 흡수)
        trackIdentity: input.playback.linkId,
      };
    },

    updateCounts(counts: SummaryCounts): void {
      if (snapshot) snapshot = { ...snapshot, counts };
    },

    /** DEACTIVATE 계열 경계 — 있으면 방출 후 clear. */
    flushBoundary(now: number): PlaybackSummary | null {
      if (!snapshot) return null;
      const emitted = toSummary(snapshot, now);
      snapshot = null;
      return emitted;
    },

    /** L1(방 enter)·L2(재연결) — 놓친 경계는 기념하지 않음. */
    clear(): void {
      snapshot = null;
    },
  };
}

export type PlaybackSummaryTracker = ReturnType<typeof createPlaybackSummaryTracker>;
