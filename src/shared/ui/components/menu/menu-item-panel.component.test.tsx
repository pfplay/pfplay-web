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

vi.mock('@headlessui/react', () => {
  return {
    Transition: ({ children }: any) => children,
    MenuItems: ({ children, as: As = 'div', ...props }: any) => {
      const { anchor: _anchor, ...rest } = props;
      return As === 'ul' ? <ul {...rest}>{children}</ul> : <div {...rest}>{children}</div>;
    },
    MenuItem: ({ children }: any) => {
      const rendered = typeof children === 'function' ? children({ focus: false }) : children;
      return <>{rendered}</>;
    },
  };
});

import { render, fireEvent } from '@testing-library/react';
import MenuItemPanel from './menu-item-panel.component';
import type { MenuItem } from './menu-item-panel.component';

const createItems = (...labels: string[]): MenuItem[] =>
  labels.map((label) => ({ label, onClickItem: vi.fn() }));

describe('MenuItemPanel', () => {
  test('메뉴 아이템을 렌더링한다', () => {
    const onMenuClose = vi.fn();
    const { getByText } = render(
      <MenuItemPanel menuItemConfig={createItems('항목1', '항목2')} onMenuClose={onMenuClose} />
    );
    expect(getByText('항목1')).toBeTruthy();
    expect(getByText('항목2')).toBeTruthy();
  });

  test('visible=false인 항목은 렌더링하지 않는다', () => {
    const items: MenuItem[] = [
      { label: '보이는항목', onClickItem: vi.fn() },
      { label: '숨긴항목', onClickItem: vi.fn(), visible: false },
    ];
    const { queryByText } = render(<MenuItemPanel menuItemConfig={items} onMenuClose={vi.fn()} />);
    expect(queryByText('보이는항목')).toBeTruthy();
    expect(queryByText('숨긴항목')).toBeNull();
  });

  test('아이템 클릭 시 onClickItem과 onMenuClose를 호출한다', () => {
    const items = createItems('항목1');
    const onMenuClose = vi.fn();
    const { getByText } = render(
      <MenuItemPanel menuItemConfig={items} onMenuClose={onMenuClose} />
    );
    fireEvent.click(getByText('항목1'));
    expect(items[0].onClickItem).toHaveBeenCalledTimes(1);
    expect(onMenuClose).toHaveBeenCalledTimes(1);
  });

  test('HeaderIcon이 있으면 렌더링한다', () => {
    const { getByText } = render(
      <MenuItemPanel
        menuItemConfig={createItems('항목1')}
        onMenuClose={vi.fn()}
        HeaderIcon={<span>헤더아이콘</span>}
      />
    );
    expect(getByText('헤더아이콘')).toBeTruthy();
  });

  test('HeaderIcon 클릭 시 onMenuClose를 호출한다', () => {
    const onMenuClose = vi.fn();
    const { getByText } = render(
      <MenuItemPanel
        menuItemConfig={createItems('항목1')}
        onMenuClose={onMenuClose}
        HeaderIcon={<span>헤더아이콘</span>}
      />
    );
    fireEvent.click(getByText('헤더아이콘'));
    expect(onMenuClose).toHaveBeenCalledTimes(1);
  });
});
