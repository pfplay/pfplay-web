import type { RefObject, RefCallback } from 'react';
import { combineRef } from './combine-ref';

describe('combineRef', () => {
  test('모든 ref가 정상적으로 합쳐져야 한다.', () => {
    const fakeRef1: RefObject<string> = { current: null };
    const fakeRef2: RefObject<string> = { current: null };
    const fakeRef3: RefCallback<string> = jest.fn();

    const combinedRef = combineRef([fakeRef1, fakeRef2, fakeRef3]);

    const value = 'value'; // ref에 전달될 값
    combinedRef(value);

    expect(fakeRef1.current).toBe(value);
    expect(fakeRef2.current).toBe(value);
    expect(fakeRef3).toHaveBeenCalledWith(value);
  });

  test('undefined 또는 null ref가 있는 경우에도 정상적으로 처리해야 한다.', () => {
    const fakeRef1: RefObject<string> = { current: null };
    const fakeRef2 = null;
    const fakeRef3 = undefined;

    const combinedRef = combineRef([fakeRef1, fakeRef2, fakeRef3]);

    const value = 'value'; // ref에 전달될 값
    combinedRef(value);

    expect(fakeRef1.current).toBe(value);
  });
});
