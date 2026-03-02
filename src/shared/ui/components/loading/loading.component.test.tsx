import { render } from '@testing-library/react';
import Loading from './loading.component';

describe('Loading', () => {
  test('기본 렌더링 — SVG가 표시된다', () => {
    const { container } = render(<Loading />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  test('기본 size는 1em이다', () => {
    const { container } = render(<Loading />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('1em');
    expect(svg.getAttribute('height')).toBe('1em');
  });

  test('size prop이 반영된다', () => {
    const { container } = render(<Loading size={32} />);
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('32');
    expect(svg.getAttribute('height')).toBe('32');
  });

  test('color prop이 stroke에 반영된다', () => {
    const { container } = render(<Loading color='#ff0000' />);
    const path = container.querySelector('path');
    expect(path?.getAttribute('stroke')).toBe('#ff0000');
  });

  test('animate-loading 클래스가 적용된다', () => {
    const { container } = render(<Loading />);
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal).toContain('animate-loading');
  });
});
