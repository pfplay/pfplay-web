import { isPureObject } from './isPureObject';

describe('isPureObject', () => {
  it('일반 객체에 대해 true 를 반환해야 함', () => {
    expect(isPureObject({})).toBe(true);
    expect(isPureObject({ key: 'value' })).toBe(true);
  });

  it('null, array 를 포함한, 순수 객체가 아닌 타입에 대해 false 를 반환해야 함', () => {
    expect(isPureObject(123)).toBe(false);
    expect(isPureObject('string')).toBe(false);
    expect(isPureObject(true)).toBe(false);
    expect(isPureObject(undefined)).toBe(false);
    expect(isPureObject(null)).toBe(false);
    expect(isPureObject(Symbol('symbol'))).toBe(false);
    expect(isPureObject(function () {})).toBe(false);
    expect(isPureObject([])).toBe(false);
  });
});
