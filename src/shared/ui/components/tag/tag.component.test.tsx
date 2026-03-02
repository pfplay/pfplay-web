import { render, screen } from '@testing-library/react';
import Tag from './tag.component';

jest.mock('../typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

describe('Tag', () => {
  test('variant="filled"일 때 value가 렌더링된다', () => {
    render(<Tag variant='filled' value='NEW' />);
    expect(screen.getByText('NEW')).toBeTruthy();
  });

  test('variant="outlined"일 때 value가 렌더링된다', () => {
    render(<Tag variant='outlined' value='HOT' />);
    expect(screen.getByText('HOT')).toBeTruthy();
  });

  test('variant="profile"일 때 PrefixIcon과 value가 렌더링된다', () => {
    render(
      <Tag variant='profile' value='사용자' PrefixIcon={<svg data-testid='profile-icon' />} />
    );

    expect(screen.getByText('사용자')).toBeTruthy();
    expect(screen.getByTestId('profile-icon')).toBeTruthy();
  });

  test('variant="filled"일 때 bg-red-400 클래스가 적용된다', () => {
    const { container } = render(<Tag variant='filled' value='태그' />);
    expect(container.firstElementChild?.className).toContain('bg-red-400');
  });

  test('variant="outlined"일 때 border 클래스가 적용된다', () => {
    const { container } = render(<Tag variant='outlined' value='태그' />);
    expect(container.firstElementChild?.className).toContain('border');
  });
});
