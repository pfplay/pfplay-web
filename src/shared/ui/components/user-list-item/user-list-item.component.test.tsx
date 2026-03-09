import { render, screen } from '@testing-library/react';
import UserListItem from './user-list-item.component';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: any) => <img src={src} alt={alt} {...rest} />,
}));

vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/shared/ui/components/display-option-menu-on-hover-listener', () => ({
  DisplayOptionMenuOnHoverListener: ({ children }: any) => (
    <div data-testid='hover-menu'>{children}</div>
  ),
}));

describe('UserListItem', () => {
  const defaultConfig = {
    nickname: '사용자1',
    avatarIconUri: 'https://example.com/avatar.png',
  };

  test('닉네임이 렌더링된다', () => {
    render(<UserListItem userListItemConfig={defaultConfig} />);
    expect(screen.getByText('사용자1')).toBeTruthy();
  });

  test('아바타 이미지가 렌더링된다', () => {
    render(<UserListItem userListItemConfig={defaultConfig} />);
    const img = screen.getByAltText('사용자1');
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
  });

  test('avatarIconUri가 없으면 기본 이미지가 사용된다', () => {
    render(<UserListItem userListItemConfig={{ nickname: '유저' }} />);
    const img = screen.getByAltText('유저');
    expect(img.getAttribute('src')).toContain('monkey.png');
  });

  test('menuItemList가 있으면 hover 메뉴가 렌더링된다', () => {
    const menuItems = [{ label: '차단', onClickItem: vi.fn() }];
    render(<UserListItem userListItemConfig={defaultConfig} menuItemList={menuItems} />);
    expect(screen.getByTestId('hover-menu')).toBeTruthy();
  });

  test('menuDisabled=true이면 hover 메뉴가 렌더링되지 않는다', () => {
    const menuItems = [{ label: '차단', onClickItem: vi.fn() }];
    render(
      <UserListItem userListItemConfig={defaultConfig} menuItemList={menuItems} menuDisabled />
    );
    expect(screen.queryByTestId('hover-menu')).toBeNull();
  });

  test('suffix가 렌더링된다', () => {
    render(
      <UserListItem
        userListItemConfig={defaultConfig}
        suffix={{ type: 'button', Component: <button>동작</button> }}
      />
    );
    expect(screen.getByText('동작')).toBeTruthy();
  });
});
