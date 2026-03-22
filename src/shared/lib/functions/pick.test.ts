import { pick } from './pick';

describe('pick', () => {
  test('should pick the specified keys from the object', () => {
    const obj = {
      a: 1,
      b: '2',
      c: true,
    };

    expect(pick(obj, ['a', 'b'])).toEqual({ a: 1, b: '2' });
  });
});
