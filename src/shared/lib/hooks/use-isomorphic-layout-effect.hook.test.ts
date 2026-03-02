import { useLayoutEffect } from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.hook';

describe('useIsomorphicLayoutEffect', () => {
  test('브라우저 환경(window 존재) → useLayoutEffect를 export한다', () => {
    // jsdom 환경에서는 window가 존재하므로 useLayoutEffect가 선택됨
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });
});
