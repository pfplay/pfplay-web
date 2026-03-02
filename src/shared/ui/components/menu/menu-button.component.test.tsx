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

import { Menu } from '@headlessui/react';
import { render, fireEvent } from '@testing-library/react';
import MenuButton from './menu-button.component';

const renderInMenu = (ui: React.ReactElement) => render(<Menu>{ui}</Menu>);

describe('MenuButton', () => {
  test('children을 렌더링한다', () => {
    const { getByText } = renderInMenu(<MenuButton type='icon'>메뉴</MenuButton>);
    expect(getByText('메뉴')).toBeTruthy();
  });

  test('클릭 시 onMenuIconClick을 호출한다', () => {
    const onClick = jest.fn();
    const { getByRole } = renderInMenu(
      <MenuButton type='icon' onMenuIconClick={onClick}>
        아이콘
      </MenuButton>
    );
    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('type="button"이면 border 스타일 클래스를 포함한다', () => {
    const { getByRole } = renderInMenu(<MenuButton type='button'>버튼</MenuButton>);
    expect(getByRole('button').className).toContain('border');
  });

  test('type="icon"이면 text-gray-50 클래스를 포함한다', () => {
    const { getByRole } = renderInMenu(<MenuButton type='icon'>아이콘</MenuButton>);
    expect(getByRole('button').className).toContain('text-gray-50');
  });
});
