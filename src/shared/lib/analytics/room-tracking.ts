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

export const __testing__ = {
  FIRST_ENTERED_AT_KEY,
  entryTimestamps,
};
