import { isPureObject } from '@/shared/lib/functions/is-pure-object';

test('isPureObject', () => {
  expect(isPureObject({})).toBe(true);
  expect(isPureObject({ a: 1 })).toBe(true);
  expect(isPureObject([])).toBe(false);
  expect(isPureObject(null)).toBe(false);
  expect(isPureObject(undefined)).toBe(false);
  expect(isPureObject('')).toBe(false);
  expect(isPureObject(0)).toBe(false);
  expect(isPureObject(true)).toBe(false);
});
