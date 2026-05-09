import type { StageType } from '@/shared/api/http/types/@enums';

import type { EntrySource } from './events';
import { identify, track } from './index';
import { stageTypeLabel } from './labels';

const FIRST_ENTERED_AT_KEY = 'pfp_amplitude_first_partyroom_entered_at_marked';

const entryTimestamps = new Map<number, number>();

export function recordPartyroomEntry(partyroomId: number, now: number = Date.now()): void {
  entryTimestamps.set(partyroomId, now);
}

export function consumePartyroomEntry(
  partyroomId: number,
  now: number = Date.now()
): number | null {
  const startedAt = entryTimestamps.get(partyroomId);
  if (startedAt === undefined) return null;
  entryTimestamps.delete(partyroomId);
  return Math.max(0, Math.round((now - startedAt) / 1000));
}

export function __clearAllEntryTimestamps(): void {
  entryTimestamps.clear();
}

const VALID_ENTRY_SOURCES: ReadonlySet<EntrySource> = new Set<EntrySource>([
  'list',
  'link',
  'direct',
]);

export function parseEntrySource(raw: string | null | undefined): EntrySource {
  if (raw && (VALID_ENTRY_SOURCES as Set<string>).has(raw)) {
    return raw as EntrySource;
  }
  return 'direct';
}

function markFirstPartyroomEnteredOnce(now: Date = new Date()): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(FIRST_ENTERED_AT_KEY)) return;
    const iso = now.toISOString();
    window.localStorage.setItem(FIRST_ENTERED_AT_KEY, iso);
    identify({ setOnce: { first_partyroom_entered_at: iso } });
  } catch {
    /* localStorage unavailable — degrade silently */
  }
}

export type TrackPartyroomEnteredArgs = {
  partyroomId: number;
  crewCount: number;
  entrySource: EntrySource;
  stageType?: StageType;
};

export function trackPartyroomEntered({
  partyroomId,
  crewCount,
  entrySource,
  stageType,
}: TrackPartyroomEnteredArgs): void {
  recordPartyroomEntry(partyroomId);
  track('Partyroom Entered', {
    partyroom_id: partyroomId,
    crew_count: crewCount,
    entry_source: entrySource,
    ...(stageType ? { stage_type: stageTypeLabel(stageType) } : {}),
  });
  markFirstPartyroomEnteredOnce();
}

export function trackPartyroomExited(partyroomId: number): void {
  const duration = consumePartyroomEntry(partyroomId);
  if (duration === null) return;
  track('Partyroom Exited', {
    partyroom_id: partyroomId,
    duration_sec: duration,
  });
}

// ────────────────────────────────────────────────────────────
// DJ deregister attribution
//
// `DJ Deregistered(reason='self')` 는 useUnregisterMeFromQueue mutation
// onSuccess 에서 직접 발화한다. 같은 행동에 대해 backend 가 보내는
// DJ_QUEUE_CHANGED WebSocket 이벤트가 도착하면 self-removal 검출 로직이
// 다시 발화하려 하므로, mutation onMutate 에서 짧은 suppression 윈도우를
// 설정해 중복을 방지한다.
//
// Limitation: server-side auto-cleanup (e.g. DJ 자신의 플레이리스트가
// 삭제되어 자동 강제 해제) 같이 backend-initiated 한 self 제거도
// 'admin' 으로 분류된다. spec §7 L6 참조.
// ────────────────────────────────────────────────────────────

const DEFAULT_SELF_DEREGISTER_SUPPRESS_MS = 5000;
let selfDjDeregisterSuppressedUntil = 0;

export function suppressNextSelfDjDeregister(
  durationMs: number = DEFAULT_SELF_DEREGISTER_SUPPRESS_MS,
  now: number = Date.now()
): void {
  selfDjDeregisterSuppressedUntil = now + durationMs;
}

function consumeSelfDjDeregisterSuppression(now: number = Date.now()): boolean {
  if (now < selfDjDeregisterSuppressedUntil) {
    selfDjDeregisterSuppressedUntil = 0;
    return true;
  }
  return false;
}

export function trackDjAdminDeregisterDetected(partyroomId: number): void {
  if (consumeSelfDjDeregisterSuppression()) return;
  track('DJ Deregistered', {
    partyroom_id: partyroomId,
    reason: 'admin',
  });
}

export function __clearSelfDjDeregisterSuppression(): void {
  selfDjDeregisterSuppressedUntil = 0;
}

export const __testing__ = {
  FIRST_ENTERED_AT_KEY,
  entryTimestamps,
};
