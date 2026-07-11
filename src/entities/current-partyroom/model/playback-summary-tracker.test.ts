import { describe, expect, it } from 'vitest';
import { SKIP_TOLERANCE_MS, createPlaybackSummaryTracker } from './playback-summary-tracker';

const start = (o = {}) => ({
  eventId: 'e1',
  trackName: 'Butter',
  trackIdentity: 'link-1',
  djNickname: '크릴린',
  durationText: '3:00',
  now: 1_000_000,
  ...o,
});

const NOW = 1_000_000;
const DURATION_MS = 180_000; // '3:00'
const EXPECTED_END = NOW + DURATION_MS;

describe('PlaybackSummaryTracker', () => {
  it('시드① — expectedEnd = now + duration(로컬)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());

    // 정확히 expectedEnd 시점 경계 = 완주
    const s = t.flushBoundary(EXPECTED_END);
    expect(s).toMatchObject({
      trackName: 'Butter',
      djNickname: '크릴린',
      counts: { like: 0, dislike: 0, grab: 0 },
      skipped: false,
    });
  });

  it('방출 — 다음 시작이 이전 스냅샷을 요약으로 반환', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 3, dislike: 0, grab: 1 });
    const s = t.seedFromStart(
      start({ eventId: 'e2', trackIdentity: 'link-2', now: 1_000_000 + 180_000 })
    );
    expect(s).toMatchObject({
      trackName: 'Butter',
      counts: { like: 3, dislike: 0, grab: 1 },
      skipped: false,
    });
  });

  it('첫 시드는 방출 없음(null)', () => {
    const t = createPlaybackSummaryTracker();
    expect(t.seedFromStart(start())).toBeNull();
  });

  it('스킵 판정 — expectedEnd − 5s보다 이르면 skipped=true, 경계값은 false', () => {
    const threshold = EXPECTED_END - SKIP_TOLERANCE_MS;

    // threshold − 1ms: 이르다 → 스킵
    const early = createPlaybackSummaryTracker();
    early.seedFromStart(start());
    expect(early.flushBoundary(threshold - 1)?.skipped).toBe(true);

    // threshold 정각: 이르지 않다 → 완주
    const onTime = createPlaybackSummaryTracker();
    onTime.seedFromStart(start());
    expect(onTime.flushBoundary(threshold)?.skipped).toBe(false);
  });

  it('L5 — 동일 eventId 재전달은 완전 무시(방출·재시드 없음)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 2, dislike: 1, grab: 0 });

    // 동일 eventId 재전달 — 방출(null)도 재시드(counts 리셋)도 없어야 한다
    expect(t.seedFromStart(start({ now: NOW + 60_000 }))).toBeNull();

    const s = t.flushBoundary(EXPECTED_END);
    expect(s).toMatchObject({
      trackName: 'Butter',
      counts: { like: 2, dislike: 1, grab: 0 },
      skipped: false, // 재시드됐다면 expectedEnd가 밀려 skipped=true로 오판된다
    });
  });

  it('flushBoundary — 방출 후 clear되어 2번째 호출은 null (이중 DEACTIVATE)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    expect(t.flushBoundary(EXPECTED_END)).not.toBeNull();
    expect(t.flushBoundary(EXPECTED_END)).toBeNull();
  });

  it('빈 상태 flushBoundary는 null', () => {
    const t = createPlaybackSummaryTracker();
    expect(t.flushBoundary(NOW)).toBeNull();
  });

  it('L1/L2 — clear 후 flush는 null', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.clear();
    expect(t.flushBoundary(EXPECTED_END)).toBeNull();
  });

  it('시드② — endTime 기반 시드, 이후 boundary에서 정상 방출', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromSetup({
      playback: { name: 'Dynamite', linkId: 'link-9', endTime: NOW + 120_000 },
      counts: { like: 4, dislike: 2, grab: 1 },
      djNickname: '정국',
      now: NOW,
    });

    const s = t.flushBoundary(NOW + 120_000);
    expect(s).toMatchObject({
      trackName: 'Dynamite',
      djNickname: '정국',
      counts: { like: 4, dislike: 2, grab: 1 },
      skipped: false,
    });
  });

  it('시드② — 조기 경계는 skipped=true (endTime 기준)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromSetup({
      playback: { name: 'Dynamite', linkId: 'link-9', endTime: NOW + 120_000 },
      counts: undefined,
      djNickname: null,
      now: NOW,
    });

    const s = t.flushBoundary(NOW + 120_000 - SKIP_TOLERANCE_MS - 1);
    expect(s).toMatchObject({
      counts: { like: 0, dislike: 0, grab: 0 },
      skipped: true,
    });
  });

  it('시드② 불일치 — 보유 스냅샷 폐기(방출 없음) 후 재시드', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 7, dislike: 0, grab: 0 });

    t.seedFromSetup({
      playback: { name: 'Dynamite', linkId: 'link-9', endTime: NOW + 300_000 },
      counts: { like: 1, dislike: 0, grab: 0 },
      djNickname: '정국',
      now: NOW + 60_000,
    });

    // 이전 Butter 스냅샷은 구획 없이 폐기 — flush는 setup 곡을 방출
    const s = t.flushBoundary(NOW + 300_000);
    expect(s).toMatchObject({
      trackName: 'Dynamite',
      djNickname: '정국',
      counts: { like: 1, dislike: 0, grab: 0 },
      skipped: false,
    });
    expect(t.flushBoundary(NOW + 300_000)).toBeNull();
  });

  it('시드② L3 동일 identity — counts만 덮고 expectedEndAtLocal은 기존 로컬 추정 유지', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start()); // link-1, 로컬 expectedEnd = 1_180_000
    t.updateCounts({ like: 2, dislike: 0, grab: 0 });

    // 서버 endTime(1_100_000)은 로컬 추정보다 이르다 — 덮이면 스킵 판정이 뒤집힌다
    t.seedFromSetup({
      playback: { name: 'Butter', linkId: 'link-1', endTime: 1_100_000 },
      counts: { like: 9, dislike: 3, grab: 2 },
      djNickname: '크릴린',
      now: NOW + 50_000,
    });

    // 1_120_000: 로컬 추정(1_180_000) 유지 시 threshold(1_175_000)보다 이르다 → skipped=true
    // (endTime 1_100_000으로 덮였다면 threshold 1_095_000 → false로 오판)
    const s = t.flushBoundary(1_120_000);
    expect(s).toMatchObject({
      counts: { like: 9, dislike: 3, grab: 2 },
      skipped: true,
    });
  });

  it('시드② L3 동일 identity — counts 미제공이면 기존 counts 유지', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 2, dislike: 0, grab: 0 });

    t.seedFromSetup({
      playback: { name: 'Butter', linkId: 'link-1', endTime: NOW + 170_000 },
      counts: undefined,
      djNickname: '크릴린',
      now: NOW + 50_000,
    });

    expect(t.flushBoundary(EXPECTED_END)?.counts).toEqual({ like: 2, dislike: 0, grab: 0 });
  });

  it('시드② L4 — endTime이 now보다 과거면 무시(보유 스냅샷 유지)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.updateCounts({ like: 5, dislike: 0, grab: 0 });

    t.seedFromSetup({
      playback: { name: 'Stale', linkId: 'link-stale', endTime: NOW + 59_999 },
      counts: { like: 0, dislike: 0, grab: 0 },
      djNickname: null,
      now: NOW + 60_000,
    });

    const s = t.flushBoundary(EXPECTED_END);
    expect(s).toMatchObject({
      trackName: 'Butter',
      counts: { like: 5, dislike: 0, grab: 0 },
    });
  });

  it('시드② playback 없음 — clear', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start());
    t.seedFromSetup({
      playback: undefined,
      counts: undefined,
      djNickname: null,
      now: NOW + 60_000,
    });
    expect(t.flushBoundary(EXPECTED_END)).toBeNull();
  });

  it('L7 — durationText 파싱 실패 시 expectedEnd=null → skipped=false fail-safe', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start({ durationText: 'abc' }));

    // 시드 직후 즉시 경계 — 파싱 성공이었다면 명백한 스킵 시점
    const s = t.flushBoundary(NOW + 1);
    expect(s).toMatchObject({ trackName: 'Butter', skipped: false });
  });

  it('h:mm:ss — "1:02:03"은 3723초로 계산되어 조기 경계가 skipped=true', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start({ durationText: '1:02:03' }));

    // naive 2토큰 파싱(62초)이라면 62초 뒤 경계는 완주로 오분류된다
    const s = t.flushBoundary(NOW + 62_000);
    expect(s).toMatchObject({ skipped: true });
  });

  it('updateCounts — 빈 상태에서는 no-op', () => {
    const t = createPlaybackSummaryTracker();
    t.updateCounts({ like: 1, dislike: 1, grab: 1 });
    expect(t.flushBoundary(NOW)).toBeNull();
  });

  it('djNickname null 시드는 요약에도 null로 유지(폴백은 렌더 책임)', () => {
    const t = createPlaybackSummaryTracker();
    t.seedFromStart(start({ djNickname: null }));
    expect(t.flushBoundary(EXPECTED_END)?.djNickname).toBeNull();
  });
});
