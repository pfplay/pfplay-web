import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import Typography from './typography.component';

describe('Typography', () => {
  test('children 텍스트가 렌더링된다', () => {
    render(<Typography>안녕하세요</Typography>);
    expect(screen.getByText('안녕하세요')).toBeTruthy();
  });

  test('기본 태그는 p이다 (type="detail1")', () => {
    const { container } = render(<Typography>텍스트</Typography>);
    expect(container.querySelector('p')).not.toBeNull();
  });

  test('type="title1"일 때 h1 태그로 렌더링된다', () => {
    const { container } = render(<Typography type='title1'>제목</Typography>);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  test('type="title2"일 때 h2 태그로 렌더링된다', () => {
    const { container } = render(<Typography type='title2'>부제목</Typography>);
    expect(container.querySelector('h2')).not.toBeNull();
  });

  test('as prop으로 태그를 변경할 수 있다', () => {
    const { container } = render(<Typography as='span'>인라인</Typography>);
    expect(container.querySelector('span')).not.toBeNull();
  });

  test('title 타입일 때 ellipsis overflow가 기본 적용된다', () => {
    const { container } = render(<Typography type='title1'>긴 제목</Typography>);
    const el = container.querySelector('h1');
    expect(el?.className).toContain('truncate');
  });

  test('title 타입 + 문자열 children일 때 title 속성이 설정된다', () => {
    const { container } = render(<Typography type='title1'>마우스 오버 텍스트</Typography>);
    const el = container.querySelector('h1');
    expect(el?.getAttribute('title')).toBe('마우스 오버 텍스트');
  });

  test('overflow="break-words"가 적용된다', () => {
    const { container } = render(<Typography overflow='break-words'>텍스트</Typography>);
    const el = container.querySelector('p');
    expect(el?.className).toContain('break-words');
  });

  test('ref가 전달된다', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Typography ref={ref}>텍스트</Typography>);
    expect(ref.current).not.toBeNull();
  });

  test('className이 병합된다', () => {
    const { container } = render(<Typography className='custom-class'>텍스트</Typography>);
    const el = container.querySelector('p');
    expect(el?.className).toContain('custom-class');
  });
});
