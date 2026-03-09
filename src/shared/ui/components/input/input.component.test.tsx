import { render, screen, fireEvent } from '@testing-library/react';
import Input from './input.component';

vi.mock('../typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

vi.mock('@/shared/lib/functions/combine-ref', () => ({
  combineRef: (refs: any[]) => (el: any) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(el);
      else if (ref && typeof ref === 'object') ref.current = el;
    });
  },
}));

describe('Input', () => {
  test('기본 렌더링 — input 요소가 존재한다', () => {
    render(<Input placeholder='테스트' />);

    expect(screen.getByPlaceholderText('테스트')).toBeTruthy();
  });

  test('비제어 모드: defaultValue 설정 후 타이핑하면 value가 변경된다', () => {
    render(<Input defaultValue='초기값' placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력') as HTMLInputElement;
    expect(input.value).toBe('초기값');

    fireEvent.change(input, { target: { value: '새로운 값' } });
    expect(input.value).toBe('새로운 값');
  });

  test('제어 모드: value prop이 반영된다', () => {
    render(<Input value='제어값' placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력') as HTMLInputElement;
    expect(input.value).toBe('제어값');
  });

  test('maxLength 카운터가 0/10 형식으로 표시된다', () => {
    const { container } = render(<Input maxLength={10} placeholder='입력' />);

    expect(container.textContent).toContain('/10');
    expect(container.textContent).toContain('00');
  });

  test('maxLength 초과 시 빨간색 카운터 클래스가 적용된다', () => {
    const { container } = render(<Input value='12345678901' maxLength={10} placeholder='입력' />);

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect((strong as HTMLElement).className).toContain('text-red-300');
  });

  test('Enter 키를 누르면 onPressEnter 콜백이 호출된다', () => {
    const onPressEnter = vi.fn();
    render(<Input onPressEnter={onPressEnter} placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력');
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  test('Prefix와 Suffix가 렌더링된다', () => {
    render(<Input Prefix={<span>접두사</span>} Suffix={<span>접미사</span>} placeholder='입력' />);

    expect(screen.getByText('접두사')).toBeTruthy();
    expect(screen.getByText('접미사')).toBeTruthy();
  });

  test('wrapper 클릭 시 input이 포커스된다', () => {
    const { container } = render(<Input placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력');
    const wrapper = container.firstElementChild as HTMLElement;

    const focusSpy = vi.spyOn(input, 'focus');
    fireEvent.click(wrapper);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });
});
