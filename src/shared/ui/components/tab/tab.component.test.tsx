import { render, screen, fireEvent } from '@testing-library/react';
import Tab, { TabGroup, TabList, TabPanel, TabPanels } from './tab.component';

jest.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

 
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

describe('Tab', () => {
  function renderTabs(variant: 'line' | 'text' = 'line') {
    return render(
      <TabGroup>
        <TabList>
          <Tab tabTitle='탭1' variant={variant} />
          <Tab tabTitle='탭2' variant={variant} />
        </TabList>
        <TabPanels>
          <TabPanel>패널1 내용</TabPanel>
          <TabPanel>패널2 내용</TabPanel>
        </TabPanels>
      </TabGroup>
    );
  }

  test('탭 제목들이 렌더링된다', () => {
    renderTabs();

    expect(screen.getByText('탭1')).toBeTruthy();
    expect(screen.getByText('탭2')).toBeTruthy();
  });

  test('첫 번째 탭 패널이 기본 표시된다', () => {
    renderTabs();
    expect(screen.getByText('패널1 내용')).toBeTruthy();
  });

  test('두 번째 탭 클릭 시 해당 패널이 표시된다', () => {
    renderTabs();

    fireEvent.click(screen.getByText('탭2'));
    expect(screen.getByText('패널2 내용')).toBeTruthy();
  });

  test('variant="text"로 렌더링된다', () => {
    renderTabs('text');
    expect(screen.getByText('탭1')).toBeTruthy();
  });

  test('PrefixIcon이 렌더링된다', () => {
    render(
      <TabGroup>
        <TabList>
          <Tab tabTitle='아이콘탭' variant='line' PrefixIcon={<svg data-testid='prefix-icon' />} />
        </TabList>
        <TabPanels>
          <TabPanel>내용</TabPanel>
        </TabPanels>
      </TabGroup>
    );

    expect(screen.getByTestId('prefix-icon')).toBeTruthy();
  });
});
