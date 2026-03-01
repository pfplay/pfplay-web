import { processI18nString } from './variable-processor-util';

describe('processI18nString', () => {
  test('단일 변수를 치환한다', () => {
    expect(processI18nString('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!');
  });

  test('복수 변수를 치환한다', () => {
    expect(processI18nString('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Alice' })).toBe(
      'Hi, Alice!'
    );
  });

  test('누락된 키는 빈 문자열로 치환한다', () => {
    expect(processI18nString('Hello, {{name}}!', {})).toBe('Hello, !');
  });

  test('플레이스홀더가 없는 문자열은 그대로 반환한다', () => {
    expect(processI18nString('No placeholders here', { name: 'World' })).toBe(
      'No placeholders here'
    );
  });

  test('빈 문자열을 입력하면 빈 문자열을 반환한다', () => {
    expect(processI18nString('', { name: 'World' })).toBe('');
  });
});
