import { render, screen, fireEvent } from '@testing-library/react';
import Select, { SelectOption } from './select.component';

// Headless UI uses ResizeObserver

global.ResizeObserver = class ResizeObserver {
  public observe() {
    /* noop */
  }
  public unobserve() {
    /* noop */
  }
  public disconnect() {
    /* noop */
  }
} as any;

vi.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/shared/ui/icons', () => ({
  PFChevronDown: () => <svg data-testid='chevron-down' />,
  PFChevronUp: () => <svg data-testid='chevron-up' />,
}));

const options: SelectOption<string>[] = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'cherry', label: '체리' },
];

describe('Select', () => {
  test('기본 렌더링 — ListboxButton이 표시된다', () => {
    render(<Select options={options} onChange={vi.fn()} />);

    expect(screen.getByRole('button')).toBeTruthy();
  });

  test('defaultValue가 설정되면 해당 옵션 label이 표시된다', () => {
    render(<Select options={options} defaultValue='banana' onChange={vi.fn()} />);

    expect(screen.getByText('바나나')).toBeTruthy();
  });

  test('버튼 클릭 시 옵션 목록이 열린다', async () => {
    render(<Select options={options} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByRole('listbox')).toBeTruthy();
  });

  test('옵션 선택 시 onChange가 호출된다', async () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    const listbox = await screen.findByRole('listbox');
    const optionEls = listbox.querySelectorAll('[role="option"]');
    fireEvent.click(optionEls[2]); // '체리'

    expect(onChange).toHaveBeenCalledWith('cherry');
  });

  test('prefix/suffix가 있는 옵션이 렌더링된다', async () => {
    const optionsWithExtra: SelectOption<string>[] = [
      { value: 'a', label: '항목', prefix: <span data-testid='prefix'>P</span> },
    ];

    render(<Select options={optionsWithExtra} defaultValue='a' onChange={vi.fn()} />);

    expect(screen.getByTestId('prefix')).toBeTruthy();
  });
});
