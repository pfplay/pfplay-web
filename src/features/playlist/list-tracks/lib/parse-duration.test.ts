import { describe, expect, it } from 'vitest';

import { parseDurationToSeconds } from './parse-duration';

describe('parseDurationToSeconds', () => {
  it('parses valid colon-separated durations to total seconds', () => {
    expect(parseDurationToSeconds('3:45')).toBe(225);
    expect(parseDurationToSeconds('0:00')).toBe(0);
    expect(parseDurationToSeconds('1:02:03')).toBe(3723);
    expect(parseDurationToSeconds('12:34')).toBe(754);
    expect(parseDurationToSeconds('1:60')).toBe(120);
  });

  it('returns null for malformed or non-string input', () => {
    expect(parseDurationToSeconds('')).toBeNull();
    expect(parseDurationToSeconds('abc')).toBeNull();
    expect(parseDurationToSeconds('1:2:3:4')).toBeNull();
    expect(parseDurationToSeconds('1:')).toBeNull();
    expect(parseDurationToSeconds(undefined as any)).toBeNull();
  });
});
