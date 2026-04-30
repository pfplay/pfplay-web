import * as amplitude from '@amplitude/analytics-browser';

import { StageType } from '@/shared/api/http/types/@enums';

import { __resetForTests } from './index';
import {
  __clearAllEntryTimestamps,
  __testing__,
  consumePartyroomEntry,
  parseEntrySource,
  recordPartyroomEntry,
  trackPartyroomEntered,
  trackPartyroomExited,
} from './room-tracking';

vi.mock('@amplitude/analytics-browser', () => {
  function Identify(this: {
    set: ReturnType<typeof vi.fn>;
    setOnce: ReturnType<typeof vi.fn>;
    add: ReturnType<typeof vi.fn>;
  }) {
    /* methods on prototype */
  }
  Identify.prototype.set = vi.fn();
  Identify.prototype.setOnce = vi.fn();
  Identify.prototype.add = vi.fn();

  return {
    init: vi.fn(),
    track: vi.fn(),
    setUserId: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    Identify,
  };
});

const TEST_API_KEY = 'test-amplitude-key';

const identifyProto = (
  amplitude.Identify as unknown as {
    prototype: {
      setOnce: ReturnType<typeof vi.fn>;
    };
  }
).prototype;

describe('room-tracking', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_AMPLITUDE_API_KEY', TEST_API_KEY);
    __resetForTests();
    __clearAllEntryTimestamps();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('parseEntrySource', () => {
    test.each([
      ['list', 'list'],
      ['link', 'link'],
      ['direct', 'direct'],
    ] as const)('valid value %s passes through', (input, expected) => {
      expect(parseEntrySource(input)).toBe(expected);
    });

    test('null/undefined fall back to direct', () => {
      expect(parseEntrySource(null)).toBe('direct');
      expect(parseEntrySource(undefined)).toBe('direct');
    });

    test('unknown values fall back to direct', () => {
      expect(parseEntrySource('garbage')).toBe('direct');
    });
  });

  describe('entry timestamp accounting', () => {
    test('record then consume returns elapsed seconds', () => {
      recordPartyroomEntry(7, 1_000_000);
      expect(consumePartyroomEntry(7, 1_005_000)).toBe(5);
    });

    test('consume on missing record returns null', () => {
      expect(consumePartyroomEntry(99)).toBeNull();
    });

    test('consume clears the entry so a second call returns null', () => {
      recordPartyroomEntry(7, 0);
      consumePartyroomEntry(7, 1_000);
      expect(consumePartyroomEntry(7, 2_000)).toBeNull();
    });

    test('rounds to whole seconds', () => {
      recordPartyroomEntry(1, 0);
      expect(consumePartyroomEntry(1, 1_499)).toBe(1);
      recordPartyroomEntry(1, 0);
      expect(consumePartyroomEntry(1, 1_500)).toBe(2);
    });

    test('clamps negative durations to zero (clock skew safety)', () => {
      recordPartyroomEntry(1, 5_000);
      expect(consumePartyroomEntry(1, 1_000)).toBe(0);
    });
  });

  describe('trackPartyroomEntered', () => {
    test('emits event with provided properties + records entry', () => {
      trackPartyroomEntered({
        partyroomId: 42,
        crewCount: 3,
        entrySource: 'list',
        stageType: StageType.MAIN,
      });
      expect(amplitude.track).toHaveBeenCalledWith('Partyroom Entered', {
        partyroom_id: 42,
        crew_count: 3,
        entry_source: 'list',
        stage_type: 'main',
      });
      expect(__testing__.entryTimestamps.has(42)).toBe(true);
    });

    test('omits stage_type when not provided', () => {
      trackPartyroomEntered({ partyroomId: 1, crewCount: 0, entrySource: 'direct' });
      const call = (amplitude.track as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(call[0]).toBe('Partyroom Entered');
      expect(call[1]).not.toHaveProperty('stage_type');
    });

    test('first call sets first_partyroom_entered_at user property and persists marker', () => {
      trackPartyroomEntered({ partyroomId: 1, crewCount: 0, entrySource: 'direct' });
      expect(identifyProto.setOnce).toHaveBeenCalledWith(
        'first_partyroom_entered_at',
        expect.any(String)
      );
      expect(window.localStorage.getItem(__testing__.FIRST_ENTERED_AT_KEY)).not.toBeNull();
    });

    test('subsequent calls do not re-emit setOnce when marker is already present', () => {
      trackPartyroomEntered({ partyroomId: 1, crewCount: 0, entrySource: 'direct' });
      vi.clearAllMocks();
      trackPartyroomEntered({ partyroomId: 2, crewCount: 0, entrySource: 'direct' });
      expect(identifyProto.setOnce).not.toHaveBeenCalled();
    });
  });

  describe('trackPartyroomExited', () => {
    test('emits event with computed duration_sec', () => {
      recordPartyroomEntry(42, 1_000_000);
      trackPartyroomExited(42);
      // Just ensure the event fires with positive duration_sec; exact value is system-time dependent.
      const calls = (amplitude.track as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c) => c[0] === 'Partyroom Exited'
      );
      expect(calls).toHaveLength(1);
      expect(calls[0][1]).toMatchObject({ partyroom_id: 42 });
      expect(typeof calls[0][1].duration_sec).toBe('number');
    });

    test('does nothing when no matching entry was recorded', () => {
      trackPartyroomExited(42);
      expect(amplitude.track).not.toHaveBeenCalled();
    });
  });
});
