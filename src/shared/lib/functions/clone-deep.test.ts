import { cloneDeep } from './clone-deep';

describe('cloneDeep', () => {
  const source = Object.freeze({
    a: { aa: { aaa: 1 } },
    b: [[1]],
  });
  const cloned = cloneDeep(source);

  test('원본 객체 레퍼런스가 같지 않아야 한다', () => {
    const isRefSame = Object.is(source, cloned);
    expect(isRefSame).toEqual(false);
  });

  test('멀티뎁스 객체 레퍼런스들이 같지 않아야 한다', () => {
    const isOneDepthRefSame = Object.is(source.a, cloned.a);
    const isTwoDepthRefSame = Object.is(source.a.aa, cloned.a.aa);

    expect(isOneDepthRefSame).toEqual(false);
    expect(isTwoDepthRefSame).toEqual(false);
  });

  test('멀티뎁스 배열 레퍼런스들이 같지 않아야 한다', () => {
    const isOneDepthRefSame = Object.is(source.b, cloned.b);
    const isTwoDepthRefSame = Object.is(source.b[0], cloned.b[0]);

    expect(isOneDepthRefSame).toEqual(false);
    expect(isTwoDepthRefSame).toEqual(false);
  });
});
