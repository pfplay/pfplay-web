import { isPlainObject } from './is-plain-object';

describe('isPlainObject', () => {
  test('순수 객체를 입력했을 때 true를 반환해야 한다.', () => {
    const input = { key: 'value' };
    const result = isPlainObject(input);
    expect(result).toBe(true);
  });

  test('null을 입력했을 때 false를 반환해야 한다.', () => {
    const input = null;
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });

  test('배열을 입력했을 때 false를 반환해야 한다.', () => {
    const input = [1, 2, 3];
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });

  test('문자열을 입력했을 때 false를 반환해야 한다.', () => {
    const input = 'string';
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });

  test('숫자를 입력했을 때 false를 반환해야 한다.', () => {
    const input = 123;
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });

  test('undefined를 입력했을 때 false를 반환해야 한다.', () => {
    const input = undefined;
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });

  test('함수를 입력했을 때 false를 반환해야 한다.', () => {
    const input = () => {
      return;
    };
    const result = isPlainObject(input);
    expect(result).toBe(false);
  });
});
