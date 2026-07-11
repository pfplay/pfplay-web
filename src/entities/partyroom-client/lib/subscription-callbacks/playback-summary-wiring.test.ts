vi.mock('@/shared/lib/store/stores.context');
vi.mock('@/shared/lib/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));
vi.mock('@/shared/lib/analytics/room-tracking', () => ({
  trackDjAdminDeregisterDetected: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import type * as Crew from '@/entities/current-partyroom/model/crew.model';
import { createCurrentPartyroomStore } from '@/entities/current-partyroom/model/current-partyroom.store';
import { renderWithClient } from '@/shared/api/__test__/test-utils';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { DjChangeType, PartyroomEventType } from '@/shared/api/websocket/types/partyroom';
import { useStores } from '@/shared/lib/store/stores.context';
import useDjQueueChangedCallback from './use-dj-queue-changed-callback.hook';
import usePlaybackDeactivatedCallback from './use-playback-deactivated-callback.hook';
import usePlaybackStartCallback from './use-playback-start-callback.hook';
import useReactionAggregationCallback from './use-reaction-aggregation-callback.hook';

/**
 * 요약 구획 배선 통합성 테스트 (#444) — 실스토어+실추적기로 콜백 훅을 직접 호출.
 * ⚠️ 이벤트마다 고유 id 필수 — L5 dedup이 동일 id의 두 번째 시작을 삼킨다.
 */

const BASE = 1_700_000_000_000;

let store: ReturnType<typeof createCurrentPartyroomStore>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: BASE });
  store = createCurrentPartyroomStore();
  (useStores as Mock).mockReturnValue({ useCurrentPartyroom: store });
});

afterEach(() => {
  vi.useRealTimers();
});

const createCrew = (overrides: Partial<Crew.Model> = {}): Crew.Model => ({
  crewId: 10,
  nickname: 'DJ철수',
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: 'body.png',
  avatarFaceUri: 'face.png',
  avatarIconUri: 'icon.png',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

const startEvent = (
  id: string,
  overrides: { crewId?: number; name?: string; linkId?: string; duration?: string } = {}
) => ({
  eventType: PartyroomEventType.PLAYBACK_STARTED as const,
  partyroomId: 123,
  id,
  timestamp: Date.now(),
  crewId: overrides.crewId ?? 10,
  playback: {
    linkId: overrides.linkId ?? 'yt-a',
    name: overrides.name ?? '곡A',
    duration: overrides.duration ?? '03:00',
    thumbnailImage: 'thumb.jpg',
  },
});

const deactivatedEvent = (id: string) => ({
  eventType: PartyroomEventType.PLAYBACK_DEACTIVATED as const,
  partyroomId: 123,
  id,
  timestamp: Date.now(),
});

const djQueueChangedEvent = (id: string, changeType?: DjChangeType) => ({
  eventType: PartyroomEventType.DJ_QUEUE_CHANGED as const,
  partyroomId: 123,
  id,
  timestamp: Date.now(),
  djs: [],
  ...(changeType !== undefined ? { changeType } : {}),
});

const aggregationEvent = (id: string, like: number, dislike: number, grab: number) => ({
  eventType: PartyroomEventType.REACTION_AGGREGATION_UPDATED as const,
  partyroomId: 123,
  id,
  timestamp: Date.now(),
  aggregation: { likeCount: like, dislikeCount: dislike, grabCount: grab },
});

const summaries = () =>
  store
    .getState()
    .chat.getMessages()
    .filter((message) => message.from === 'playback-summary');

describe('플레이백 요약 구획 배선', () => {
  test('시작A→반응 갱신→완주 후 시작B — A 구획 1개(counts 반영·skipped=false·DJ 닉네임)', () => {
    store.getState().updateCrews(() => [createCrew({ crewId: 10, nickname: 'DJ철수' })]);
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const aggregate = renderHook(() => useReactionAggregationCallback()).result.current;

    start(startEvent('uuid-1', { name: '곡A', linkId: 'yt-a', duration: '03:00' }));
    aggregate(aggregationEvent('uuid-2', 5, 1, 2));

    vi.setSystemTime(BASE + 180_000); // 03:00 완주 시점
    start(startEvent('uuid-3', { name: '곡B', linkId: 'yt-b' }));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({
      from: 'playback-summary',
      trackName: '곡A',
      djNickname: 'DJ철수',
      counts: { like: 5, dislike: 1, grab: 2 },
      skipped: false,
      receivedAt: BASE + 180_000,
    });
  });

  test('조기 다음 시작(스킵) — skipped=true', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;

    start(startEvent('uuid-1', { duration: '03:00' }));
    vi.setSystemTime(BASE + 10_000);
    start(startEvent('uuid-2', { linkId: 'yt-b' }));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({ skipped: true });
  });

  test('PLAYBACK_DEACTIVATED — 구획 방출 + 기존 클리어 로직 무변경 동작', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const deactivate = renderHook(() => usePlaybackDeactivatedCallback()).result.current;

    start(startEvent('uuid-1', { duration: '03:00' }));
    vi.setSystemTime(BASE + 180_000);
    deactivate(deactivatedEvent('uuid-2'));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({ trackName: '곡A', skipped: false });
    // 기존 클리어 로직은 그대로 동작
    const state = store.getState();
    expect(state.playbackActivated).toBe(false);
    expect(state.playback).toBeUndefined();
    expect(state.currentDj).toBeUndefined();
  });

  test('이중 경계 — PLAYBACK_DEACTIVATED + DJ_QUEUE_CHANGED(DEACTIVATE)에도 구획은 정확히 1개', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const deactivate = renderHook(() => usePlaybackDeactivatedCallback()).result.current;
    const djQueueChanged = renderWithClient(() => useDjQueueChangedCallback()).result.current;

    start(startEvent('uuid-1'));
    vi.setSystemTime(BASE + 180_000);
    deactivate(deactivatedEvent('uuid-2'));
    djQueueChanged(djQueueChangedEvent('uuid-3', 'DEACTIVATE'));

    expect(summaries()).toHaveLength(1);
  });

  test('DJ_QUEUE_CHANGED(DEACTIVATE) 단독 — 경계로 동작해 구획 방출', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const djQueueChanged = renderWithClient(() => useDjQueueChangedCallback()).result.current;

    start(startEvent('uuid-1'));
    vi.setSystemTime(BASE + 180_000);
    djQueueChanged(djQueueChangedEvent('uuid-2', 'DEACTIVATE'));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({ trackName: '곡A' });
  });

  test('DJ_QUEUE_CHANGED 비-DEACTIVATE(ROTATE) — 방출 없음', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const djQueueChanged = renderWithClient(() => useDjQueueChangedCallback()).result.current;

    start(startEvent('uuid-1'));
    djQueueChanged(djQueueChangedEvent('uuid-2', 'ROTATE'));

    expect(summaries()).toHaveLength(0);
  });

  test('setup 시드(시드②) → 다음 시작 — setup 곡의 구획이 방출된다', () => {
    store.getState().playbackSummaryTracker.seedFromSetup({
      playback: { name: '셋업곡', linkId: 'yt-setup', endTime: BASE + 120_000 },
      counts: { like: 4, dislike: 0, grab: 1 },
      djNickname: '디제이',
      now: BASE,
    });
    const start = renderHook(() => usePlaybackStartCallback()).result.current;

    vi.setSystemTime(BASE + 120_000);
    start(startEvent('uuid-1', { name: '곡B', linkId: 'yt-b' }));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({
      trackName: '셋업곡',
      djNickname: '디제이',
      counts: { like: 4, dislike: 0, grab: 1 },
      skipped: false,
    });
  });

  test('L5 — 동일 event.id 재전달은 구획을 만들지 않고 스냅샷도 보존한다', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const aggregate = renderHook(() => useReactionAggregationCallback()).result.current;

    start(startEvent('uuid-1'));
    aggregate(aggregationEvent('uuid-2', 3, 0, 0));
    start(startEvent('uuid-1')); // 재전달 — 방출·재시드 없음

    expect(summaries()).toHaveLength(0);

    vi.setSystemTime(BASE + 180_000);
    start(startEvent('uuid-3', { linkId: 'yt-b' }));
    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({
      trackName: '곡A',
      counts: { like: 3, dislike: 0, grab: 0 },
      skipped: false,
    });
  });

  test('crews에 없는 crewId — djNickname null로 시드(폴백은 렌더 책임, L6)', () => {
    const start = renderHook(() => usePlaybackStartCallback()).result.current;
    const deactivate = renderHook(() => usePlaybackDeactivatedCallback()).result.current;

    start(startEvent('uuid-1', { crewId: 999 }));
    vi.setSystemTime(BASE + 180_000);
    deactivate(deactivatedEvent('uuid-2'));

    expect(summaries()).toHaveLength(1);
    expect(summaries()[0]).toMatchObject({ djNickname: null });
  });
});
