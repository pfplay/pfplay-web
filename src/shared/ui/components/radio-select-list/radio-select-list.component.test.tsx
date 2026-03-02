import { render, screen, fireEvent } from '@testing-library/react';
import { RadioSelectList, RadioSelectListItem } from './radio-select-list.component';

jest.mock('@/shared/ui/icons', () => ({
  PFChevronRight: (props: any) => <svg data-testid='chevron-right' {...props} />,
}));

describe('RadioSelectList', () => {
  const items: RadioSelectListItem<string>[] = [
    { value: 'a', label: '옵션 A' },
    { value: 'b', label: '옵션 B' },
    { value: 'c', label: '옵션 C' },
  ];

  test('모든 항목이 렌더링된다', () => {
    render(<RadioSelectList items={items} value={null} onChange={jest.fn()} />);

    expect(screen.getByText('옵션 A')).toBeTruthy();
    expect(screen.getByText('옵션 B')).toBeTruthy();
    expect(screen.getByText('옵션 C')).toBeTruthy();
  });

  test('항목 클릭 시 onChange가 해당 value로 호출된다', () => {
    const onChange = jest.fn();
    render(<RadioSelectList items={items} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText('옵션 B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  test('선택된 항목에 체크 인디케이터가 표시된다', () => {
    const { container } = render(<RadioSelectList items={items} value='b' onChange={jest.fn()} />);

    const radios = container.querySelectorAll('[data-checked]');
    const checkedValues = Array.from(radios).map((el) => el.getAttribute('data-checked'));

    expect(checkedValues).toEqual(['false', 'true', 'false']);
  });

  test('선택된 항목 내부에 흰색 원이 표시된다', () => {
    const { container } = render(<RadioSelectList items={items} value='a' onChange={jest.fn()} />);

    const checked = container.querySelector('[data-checked="true"]');
    expect(checked).not.toBeNull();

    const innerDot = checked?.querySelector('div');
    expect(innerDot).not.toBeNull();
  });

  test('빈 목록은 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<RadioSelectList items={[]} value={null} onChange={jest.fn()} />);

    const labels = container.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });
});
