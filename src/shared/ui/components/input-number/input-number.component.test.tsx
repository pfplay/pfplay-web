import { render, screen, fireEvent } from '@testing-library/react';
import InputNumber from './input-number.component';

vi.mock('@/shared/lib/functions/combine-ref', () => ({
  combineRef: (refs: any[]) => (el: any) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(el);
      else if (ref && typeof ref === 'object') ref.current = el;
    });
  },
}));

describe('InputNumber', () => {
  test('숫자만 입력 가능 — 문자가 포함된 값은 숫자만 추출된다', () => {
    render(<InputNumber defaultValue={0} placeholder='숫자' />);

    const input = screen.getByPlaceholderText('숫자') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12abc3' } });

    expect(input.value).toBe('123');
  });

  test('min 값 미만 입력 시 min으로 보정된다', () => {
    render(<InputNumber defaultValue={50} min={10} placeholder='숫자' />);

    const input = screen.getByPlaceholderText('숫자') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });

    expect(input.value).toBe('10');
  });

  test('max 값 초과 입력 시 max로 보정된다', () => {
    render(<InputNumber defaultValue={50} max={100} placeholder='숫자' />);

    const input = screen.getByPlaceholderText('숫자') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '200' } });

    expect(input.value).toBe('100');
  });

  test('비제어 모드: defaultValue 설정 후 타이핑하면 value가 변경된다', () => {
    render(<InputNumber defaultValue={42} placeholder='숫자' />);

    const input = screen.getByPlaceholderText('숫자') as HTMLInputElement;
    expect(input.value).toBe('42');

    fireEvent.change(input, { target: { value: '99' } });
    expect(input.value).toBe('99');
  });

  test('onChange 콜백이 호출된다', () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={0} onChange={onChange} placeholder='숫자' />);

    const input = screen.getByPlaceholderText('숫자');
    fireEvent.change(input, { target: { value: '7' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
