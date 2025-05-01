import React, { Fragment } from 'react';
import { isFragment } from './is-fragment';

describe('isFragment', () => {
  it('Fragment 요소에 대해 true를 반환해야 함', () => {
    const fragmentElement = <>{123}</>;
    expect(isFragment(fragmentElement)).toBe(true);

    const explicitFragment = <Fragment>내용</Fragment>;
    expect(isFragment(explicitFragment)).toBe(true);
  });

  it('Fragment가 아닌 요소에 대해 false를 반환해야 함', () => {
    const divElement = <div>내용</div>;
    expect(isFragment(divElement)).toBe(false);

    const CustomComponent = () => <div>Custom</div>;
    expect(isFragment(<CustomComponent />)).toBe(false);
  });

  it('유효하지 않은 입력에 대해 false를 반환해야 함', () => {
    expect(isFragment(null)).toBe(false);
    expect(isFragment(undefined)).toBe(false);
    expect(isFragment('문자열')).toBe(false);
    expect(isFragment(123)).toBe(false);
  });
});
