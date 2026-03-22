import React, { isValidElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import parseHtmlToReact from './parse-html-to-react';

// React 요소를 직렬화하여 비교하기 쉽게 만드는 헬퍼 함수
const renderToString = (element: ReactNode) => {
  const { container } = render(<>{element}</>);
  return container.innerHTML;
};

describe('parseHtmlToReact', () => {
  // 기본 기능 테스트
  it('should return empty array for empty string', () => {
    const result = parseHtmlToReact('');
    expect(result).toEqual([]);
  });

  it('should return original string when no HTML tags are present', () => {
    const text = 'This is plain text';
    const result = parseHtmlToReact(text);
    expect(result).toEqual([text]);
  });

  it('should keep HTML tags as strings by default', () => {
    const html = '<span>Text</span>';
    const result = parseHtmlToReact(html);

    // HTML 태그가 문자열로 유지되어야 함
    expect(result[0]).toBe('<span>Text</span>');
  });

  // keepBasicHtmlNodesFor 옵션 테스트
  it('should convert specified tags into React elements', () => {
    const html = '<span>Text</span>';
    const result = parseHtmlToReact(html, null, { keepBasicHtmlNodesFor: ['span'] });

    // 결과는 React 요소 배열이어야 함
    expect(isValidElement(result[0])).toBe(true);

    // 렌더링 결과 확인
    const rendered = renderToString(result);
    expect(rendered).toContain('<span>Text</span>');
  });

  // 속성 유지 테스트 (이 테스트가 변경된 기능을 확인)
  it('should preserve HTML attributes when converting to React elements', () => {
    const html = '<b class="text-red-300">Bold Text</b>';
    const result = parseHtmlToReact(html, null, { keepBasicHtmlNodesFor: ['b'] });

    // 결과는 React 요소 배열이어야 함
    expect(isValidElement(result[0])).toBe(true);

    // 클래스 속성이 보존되었는지 확인
    const rendered = renderToString(result);
    expect(rendered).toContain('class="text-red-300"');
  });

  // 중첩된 태그 테스트
  it('should handle nested tags correctly', () => {
    const html = '<div class="container"><span class="text">Nested Text</span></div>';
    const result = parseHtmlToReact(html, null, {
      keepBasicHtmlNodesFor: ['div', 'span'],
    });

    // 결과는 React 요소 배열이어야 함
    expect(isValidElement(result[0])).toBe(true);

    // 중첩된 요소와 속성이 모두 보존되었는지 확인
    const rendered = renderToString(result);
    expect(rendered).toContain('<div class="container">');
    expect(rendered).toContain('<span class="text">');
    expect(rendered).toContain('Nested Text');
  });

  // 다양한 속성 테스트
  it('should preserve various HTML attributes', () => {
    const html = '<a href="#" id="link" data-testid="test-link">Link</a>';
    const result = parseHtmlToReact(html, null, {
      keepBasicHtmlNodesFor: ['a'],
    });

    const rendered = renderToString(result);
    expect(rendered).toContain('href="#"');
    expect(rendered).toContain('id="link"');
    expect(rendered).toContain('data-testid="test-link"');
  });

  // 빈 요소 (void elements) 테스트
  it('should handle void elements correctly', () => {
    const html = '<div>Text with <br /> line break and <img src="test.jpg" alt="Test" /></div>';
    const result = parseHtmlToReact(html, null, {
      keepBasicHtmlNodesFor: ['div', 'br', 'img'],
    });

    const rendered = renderToString(result);
    expect(rendered).toContain('<br>');
    expect(rendered).toContain('<img src="test.jpg" alt="Test">');
  });

  // 에러 케이스 테스트
  it('should handle malformed HTML gracefully', () => {
    const html = '<div>Unclosed tag <span>Text</div>';

    // 파싱 시 에러가 발생하지 않아야 함
    expect(() => {
      parseHtmlToReact(html, null, { keepBasicHtmlNodesFor: ['div', 'span'] });
    }).not.toThrow();
  });
});
