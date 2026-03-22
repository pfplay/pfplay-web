import { omit } from '@/shared/lib/functions/omit'; // 적절한 파일 경로로 교체하세요

describe('utils/omit', () => {
  test('기본 객체에서 키를 생략', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, 'a', 'b');
    expect(result).toEqual({ c: 3 });
  });

  test('빈 객체에서 키를 생략', () => {
    const obj = {};
    const result = omit(obj, 'a', 'b');
    expect(result).toEqual({});
  });

  test('존재하지 않는 키를 생략', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, 'x', 'y');
    expect(result).toEqual(obj);
  });

  test('배열에서 키를 생략', () => {
    const obj = { a: 1, b: [2, 3, 4] };
    const result = omit(obj, 'b');
    expect(result).toEqual({ a: 1 });
  });

  test('null 대비', () => {
    const obj = null;
    const result = omit(obj, 'a');
    expect(result).toEqual(null);
  });
});
