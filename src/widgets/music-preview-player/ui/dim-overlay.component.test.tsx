import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DimOverlay from './dim-overlay.component';

describe('DimOverlay', () => {
  test('클릭 시 onClick이 호출된다', () => {
    const onClick = jest.fn();
    const { container } = render(<DimOverlay onClick={onClick} />);

    fireEvent.click(container.firstChild as Element);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('fixed 포지션 스타일이 적용된다', () => {
    const { container } = render(<DimOverlay onClick={jest.fn()} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('fixed');
    expect(el.className).toContain('inset-0');
  });

  test('className이 전달되면 추가된다', () => {
    const { container } = render(<DimOverlay onClick={jest.fn()} className='custom-class' />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });

  test('className이 없으면 추가 클래스 없이 렌더링된다', () => {
    const { container } = render(<DimOverlay onClick={jest.fn()} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('fixed');
  });
});
