import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextArea from './textarea.component';

jest.mock('../typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock('@/shared/lib/functions/combine-ref', () => ({
  combineRef: (refs: any[]) => (el: any) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(el);
      else if (ref && typeof ref === 'object') ref.current = el;
    });
  },
}));

describe('TextArea', () => {
  test('placeholder가 표시된다', () => {
    render(<TextArea placeholder='내용을 입력하세요' />);
    expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeTruthy();
  });

  test('initialValue가 카운터에 반영된다', () => {
    const { container } = render(
      <TextArea initialValue='가나다' maxLength={10} placeholder='입력' />
    );
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    // '가나다' length=3 → '03' (padStart)
    expect((strong as HTMLElement).textContent).toBe('03');
  });

  test('타이핑 시 onChange 콜백이 호출된다', () => {
    const onChange = jest.fn();
    render(<TextArea onChange={onChange} placeholder='입력' />);

    const textarea = screen.getByPlaceholderText('입력');
    fireEvent.change(textarea, { target: { value: '새 값' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('maxLength 설정 시 카운터가 표시된다', () => {
    const { container } = render(<TextArea maxLength={100} placeholder='입력' />);
    expect(container.textContent).toContain('/100');
  });

  test('maxLength 초과 시 빨간색 클래스가 적용된다', () => {
    const longText = 'a'.repeat(11);
    const { container } = render(
      <TextArea initialValue={longText} maxLength={10} placeholder='입력' />
    );

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect((strong as HTMLElement).className).toContain('text-red-300');
  });

  test('maxLength 미설정 시 카운터가 표시되지 않는다', () => {
    const { container } = render(<TextArea placeholder='입력' />);
    expect(container.querySelector('strong')).toBeNull();
  });

  test('ref가 textarea 요소에 전달된다', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} placeholder='입력' />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
