import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './button.component';

vi.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
  TypographyType: {},
}));

vi.mock('../loading', () => ({
  Loading: () => <span data-testid='loading-spinner' />,
}));

describe('Button', () => {
  test('children 텍스트가 렌더링된다', () => {
    render(<Button>확인</Button>);
    expect(screen.getByText('확인')).toBeTruthy();
  });

  test('onClick 콜백이 호출된다', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled 상태에서 클릭해도 onClick이 호출되지 않는다', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        클릭
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('disabled 상태에서 button 요소에 disabled 속성이 적용된다', () => {
    render(<Button disabled>비활성</Button>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  test('loading 상태에서 Loading 컴포넌트가 표시된다', () => {
    render(<Button loading>로딩</Button>);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  test('loading 상태에서 클릭해도 onClick이 호출되지 않는다', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        클릭
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('loading 상태에서 button 요소에 disabled 속성이 적용된다', () => {
    render(<Button loading>로딩</Button>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  test('Icon이 렌더링된다', () => {
    render(<Button Icon={<svg data-testid='icon' />}>아이콘</Button>);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  test('iconPlacement="right"일 때 아이콘이 텍스트 뒤에 위치한다', () => {
    const { container } = render(
      <Button Icon={<svg data-testid='icon' />} iconPlacement='right'>
        텍스트
      </Button>
    );

    const button = container.querySelector('button') as HTMLElement;
    const children = Array.from(button.children);
    const textIndex = children.findIndex((c) => c.textContent === '텍스트');
    const iconIndex = children.findIndex((c) => c.getAttribute('data-testid') === 'icon');

    expect(iconIndex).toBeGreaterThan(textIndex);
  });

  test('ref가 button 요소에 전달된다', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>버튼</Button>);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
