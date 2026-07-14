import { describe, expect, it } from 'vitest';

import { resolveNextTrackId } from './resolve-next-track';

describe('resolveNextTrackId', () => {
  it('커서가 중간이면 바로 다음 트랙', () => {
    expect(resolveNextTrackId([10, 20, 30, 40], 20)).toBe(30);
  });

  it('커서가 마지막이면 wrap 하여 첫 트랙', () => {
    expect(resolveNextTrackId([10, 20, 30], 30)).toBe(10);
  });

  it('커서가 null/undefined면 첫 트랙', () => {
    expect(resolveNextTrackId([10, 20, 30], null)).toBe(10);
    expect(resolveNextTrackId([10, 20, 30], undefined)).toBe(10);
  });

  it('커서가 목록에 없으면(삭제) 첫 트랙', () => {
    expect(resolveNextTrackId([10, 20, 30], 999)).toBe(10);
  });

  it('단일 트랙이면 커서가 그 트랙이어도 자기 자신', () => {
    expect(resolveNextTrackId([10], 10)).toBe(10);
    expect(resolveNextTrackId([10], null)).toBe(10);
  });

  it('빈 목록이면 null', () => {
    expect(resolveNextTrackId([], 10)).toBeNull();
    expect(resolveNextTrackId([], null)).toBeNull();
  });

  it('재정렬 시나리오 — 커서 트랙을 맨 끝으로 옮기면 NEXT가 wrap 되어 맨 앞', () => {
    // [10,20,30,40] 커서=20 → NEXT=30. 커서(20)를 끝으로: [10,30,40,20] → NEXT=wrap=10
    expect(resolveNextTrackId([10, 30, 40, 20], 20)).toBe(10);
  });
});
