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

import { render, fireEvent } from '@testing-library/react';
import IconMenu from './icon-menu.component';
import type { MenuItem } from '../menu';

const createConfig = (...labels: string[]): MenuItem[] =>
  labels.map((label) => ({ label, onClickItem: vi.fn() }));

describe('IconMenu', () => {
  test('MenuButtonIcon을 렌더링한다', () => {
    const { getByText } = render(
      <IconMenu MenuButtonIcon={<span>아이콘</span>} menuItemConfig={createConfig('항목1')} />
    );
    expect(getByText('아이콘')).toBeTruthy();
  });

  test('메뉴 버튼 클릭 시 onMenuIconClick을 호출한다', () => {
    const onMenuIconClick = vi.fn();
    const { getByRole } = render(
      <IconMenu
        MenuButtonIcon={<span>아이콘</span>}
        menuItemConfig={createConfig('항목1')}
        onMenuIconClick={onMenuIconClick}
      />
    );
    fireEvent.click(getByRole('button'));
    expect(onMenuIconClick).toHaveBeenCalledTimes(1);
  });

  test('menuContainerClassName이 적용된다', () => {
    const { container } = render(
      <IconMenu
        MenuButtonIcon={<span>아이콘</span>}
        menuItemConfig={createConfig('항목1')}
        menuContainerClassName='custom-class'
      />
    );
    expect(container.firstElementChild?.className).toContain('custom-class');
  });

  test('ref를 전달할 수 있다', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <IconMenu
        ref={ref}
        MenuButtonIcon={<span>아이콘</span>}
        menuItemConfig={createConfig('항목1')}
      />
    );
    expect(ref.current).toBeTruthy();
    expect(ref.current?.tagName).toBe('DIV');
  });
});
