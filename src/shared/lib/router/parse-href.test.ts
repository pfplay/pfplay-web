import { parseHref } from './parse-href';

describe('parseHref', () => {
  test('파라미터 없이 href 그대로 반환', () => {
    expect(parseHref('/parties')).toBe('/parties');
  });

  test('path 변수 치환', () => {
    expect(parseHref('/parties/[id]', { path: { id: 123 } })).toBe('/parties/123');
  });

  test('여러 path 변수 치환', () => {
    expect(
      parseHref('/parties/[id]/members/[memberId]', {
        path: { id: 1, memberId: 42 },
      })
    ).toBe('/parties/1/members/42');
  });

  test('존재하지 않는 path 변수는 원본 유지', () => {
    expect(parseHref('/parties/[id]', { path: {} })).toBe('/parties/[id]');
  });

  test('query 파라미터 추가', () => {
    const result = parseHref('/parties', { query: { page: 1, sort: 'latest' } });
    expect(result).toContain('/parties?');
    expect(result).toContain('page=1');
    expect(result).toContain('sort=latest');
  });

  test('path와 query 동시 사용', () => {
    const result = parseHref('/parties/[id]', {
      path: { id: 5 },
      query: { tab: 'info' },
    });
    expect(result).toBe('/parties/5?tab=info');
  });

  test('문자열 path 변수 치환', () => {
    expect(parseHref('/rooms/[slug]', { path: { slug: 'my-room' } })).toBe('/rooms/my-room');
  });
});
