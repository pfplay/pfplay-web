import VariableProcessor from './variable-processor';
import { processI18nString } from './variable-processor-util';

describe('VariableProcessor', () => {
  test('변수 치환', () => {
    const processor = new VariableProcessor({ name: 'Alice' });
    expect(processor.process('Hello {{name}}')).toBe('Hello Alice');
  });

  test('여러 변수 동시 치환', () => {
    const processor = new VariableProcessor({ a: '1', b: '2' });
    expect(processor.process('{{a}} + {{b}}')).toBe('1 + 2');
  });

  test('존재하지 않는 변수는 빈 문자열로 치환', () => {
    const processor = new VariableProcessor({});
    expect(processor.process('Hello {{name}}')).toBe('Hello ');
  });

  test('변수가 없는 문자열은 그대로 반환', () => {
    const processor = new VariableProcessor({ name: 'Alice' });
    expect(processor.process('Hello World')).toBe('Hello World');
  });

  test('같은 변수 여러 번 사용', () => {
    const processor = new VariableProcessor({ x: 'Y' });
    expect(processor.process('{{x}} and {{x}}')).toBe('Y and Y');
  });
});

describe('processI18nString', () => {
  test('변수 치환 유틸 함수', () => {
    expect(processI18nString('{{points}} 포인트 필요', { points: '50 DJ' })).toBe(
      '50 DJ 포인트 필요'
    );
  });

  test('빈 변수 객체', () => {
    expect(processI18nString('텍스트', {})).toBe('텍스트');
  });
});
