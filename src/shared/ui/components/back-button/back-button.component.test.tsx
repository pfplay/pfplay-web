import { render, screen, fireEvent } from '@testing-library/react';
import BackButton from './back-button.component';

const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}));

vi.mock('../text-button', () => ({
  TextButton: ({ children, onClick, Icon }: any) => (
    <button data-testid='text-button' onClick={onClick}>
      {Icon}
      {children}
    </button>
  ),
}));

vi.mock('@/shared/ui/icons', () => ({
  PFArrowLeft: (props: any) => <svg data-testid='arrow-left' {...props} />,
}));

describe('BackButton', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('텍스트가 렌더링된다', () => {
    render(<BackButton text='뒤로가기' />);
    expect(screen.getByText('뒤로가기')).toBeTruthy();
  });

  test('클릭 시 router.back()이 호출된다', () => {
    render(<BackButton text='뒤로' />);
    fireEvent.click(screen.getByTestId('text-button'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('화살표 아이콘이 렌더링된다', () => {
    render(<BackButton text='뒤로' />);
    expect(screen.getByTestId('arrow-left')).toBeTruthy();
  });
});
