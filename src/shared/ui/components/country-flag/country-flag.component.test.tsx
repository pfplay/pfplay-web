import { render, screen } from '@testing-library/react';
import { CountryFlag } from './country-flag.component';

describe('CountryFlag', () => {
  test('유효한 국가 코드가 주어지면 img 요소를 렌더링한다', () => {
    render(<CountryFlag code='KR' />);
    const img = screen.getByRole('img');
    expect(img).toBeDefined();
  });

  test('img의 src가 로컬 SVG 경로를 가리킨다', () => {
    render(<CountryFlag code='KR' />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/flags/KR.svg');
  });

  test('기본 크기는 width 16, height 11 (3:2 비율)이다', () => {
    render(<CountryFlag code='US' />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('width')).toBe('16');
    expect(img.getAttribute('height')).toBe('11');
  });

  test('size prop으로 크기를 변경할 수 있다', () => {
    render(<CountryFlag code='JP' size={24} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('width')).toBe('24');
    expect(img.getAttribute('height')).toBe('16');
  });

  test('빈 문자열 코드가 주어지면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<CountryFlag code='' />);
    expect(container.firstChild).toBeNull();
  });

  test('1글자 코드가 주어지면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<CountryFlag code='K' />);
    expect(container.firstChild).toBeNull();
  });
});
