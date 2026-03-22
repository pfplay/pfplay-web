import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButton from './action-button.component';

vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('ActionButton', () => {
  const defaultProps = {
    icon: <svg data-testid='icon' />,
    text: '42',
    active: false,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('아이콘과 텍스트를 렌더링한다', () => {
    render(<ActionButton {...defaultProps} />);

    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  test('클릭 시 onClick이 호출된다', () => {
    render(<ActionButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled일 때 클릭이 비활성화된다', () => {
    render(<ActionButton {...defaultProps} disabled />);
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test('active + red이면 빨간색 스타일이 적용된다', () => {
    render(<ActionButton {...defaultProps} active activeColor='red' />);
    const button = screen.getByRole('button');
    expect(button.style.color).toBe('rgb(255, 0, 0)');
  });

  test('active + green이면 초록색 스타일이 적용된다', () => {
    render(<ActionButton {...defaultProps} active activeColor='green' />);
    const button = screen.getByRole('button');
    expect(button.style.color).toBe('rgb(0, 255, 0)');
  });

  test('active이지만 activeColor가 없으면 흰색이 적용된다', () => {
    render(<ActionButton {...defaultProps} active />);
    const button = screen.getByRole('button');
    expect(button.style.color).toBe('rgb(255, 255, 255)');
  });

  test('비활성 상태면 inline color가 비어있다', () => {
    render(<ActionButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button.style.color).toBe('');
  });
});
