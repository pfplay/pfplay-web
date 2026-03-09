import { render, screen } from '@testing-library/react';
import DjListItem from './dj-list-item.component';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: any) => <img src={src} alt={alt} {...rest} />,
}));

vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/shared/ui/components/tag', () => ({
  Tag: ({ value }: any) => <span data-testid='tag'>{value}</span>,
}));

describe('DjListItem', () => {
  const defaultConfig = {
    username: 'DJ One',
    src: 'https://example.com/dj.png',
  };

  test('username이 렌더링된다', () => {
    render(<DjListItem userConfig={defaultConfig} />);
    expect(screen.getByText('DJ One')).toBeTruthy();
  });

  test('아바타 이미지가 렌더링된다', () => {
    render(<DjListItem userConfig={defaultConfig} />);
    const img = screen.getByAltText('DJ One');
    expect(img.getAttribute('src')).toBe('https://example.com/dj.png');
  });

  test('order가 렌더링된다', () => {
    render(<DjListItem userConfig={defaultConfig} order='1' />);
    expect(screen.getByText('1')).toBeTruthy();
  });

  test('suffixTagValue가 있으면 Tag가 렌더링된다', () => {
    render(<DjListItem userConfig={defaultConfig} suffixTagValue='NOW' />);
    expect(screen.getByTestId('tag')).toBeTruthy();
    expect(screen.getByText('NOW')).toBeTruthy();
  });

  test('variant="accent"일 때 border 클래스가 적용된다', () => {
    const { container } = render(<DjListItem userConfig={defaultConfig} variant='accent' />);
    expect(container.firstElementChild?.className).toContain('border-red-300');
  });

  test('variant="filled"일 때 bg 클래스가 적용된다', () => {
    const { container } = render(<DjListItem userConfig={defaultConfig} variant='filled' />);
    expect(container.firstElementChild?.className).toContain('bg-gray-800');
  });
});
