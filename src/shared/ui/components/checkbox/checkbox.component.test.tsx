import React, { createRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import Checkbox from './checkbox.component';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  globalThis.React = actual;
  return actual;
});

jest.mock('@/shared/ui/icons', () => ({
  PFCheckMark: (props: any) => <svg data-testid='check-mark' {...props} />,
}));

describe('Checkbox', () => {
  test('클릭으로 체크/해제 토글이 동작한다', () => {
    const { container } = render(<Checkbox />);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const label = container.querySelector('label') as HTMLElement;

    expect(checkbox.checked).toBe(false);

    fireEvent.click(label);
    expect(checkbox.checked).toBe(true);

    fireEvent.click(label);
    expect(checkbox.checked).toBe(false);
  });

  test('disabled 상태에서는 클릭해도 토글되지 않는다', () => {
    const { container } = render(<Checkbox disabled />);

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const label = container.querySelector('label') as HTMLElement;

    expect(checkbox.checked).toBe(false);

    fireEvent.click(label);
    expect(checkbox.checked).toBe(false);
  });

  test('onChange 콜백이 호출된다', () => {
    const onChange = jest.fn();
    const { container } = render(<Checkbox onChange={onChange} />);

    const label = container.querySelector('label') as HTMLElement;
    fireEvent.click(label);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('ref가 input 요소에 전달된다', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect((ref.current as HTMLInputElement).type).toBe('checkbox');
  });
});
