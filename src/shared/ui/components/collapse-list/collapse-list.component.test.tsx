import { render, screen, fireEvent } from '@testing-library/react';
import CollapseList from './collapse-list.component';

vi.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/shared/ui/icons', () => ({
  PFChevronDown: () => <svg data-testid='chevron-down' />,
  PFChevronUp: () => <svg data-testid='chevron-up' />,
}));

describe('CollapseList', () => {
  test('제목이 렌더링된다', () => {
    render(<CollapseList title='접을 수 있는 목록'>내용</CollapseList>);
    expect(screen.getByText('접을 수 있는 목록')).toBeTruthy();
  });

  test('초기 상태에서 내용이 숨겨져 있다', () => {
    render(<CollapseList title='목록'>숨겨진 내용</CollapseList>);
    expect(screen.queryByText('숨겨진 내용')).toBeNull();
  });

  test('버튼 클릭 시 내용이 표시된다', () => {
    render(<CollapseList title='목록'>펼쳐진 내용</CollapseList>);

    fireEvent.click(screen.getByText('목록'));
    expect(screen.getByText('펼쳐진 내용')).toBeTruthy();
  });

  test('infoText가 렌더링된다', () => {
    render(
      <CollapseList title='목록' infoText='3개'>
        내용
      </CollapseList>
    );
    expect(screen.getByText('3개')).toBeTruthy();
  });

  test('displaySuffix=false일 때 chevron 아이콘이 표시되지 않는다', () => {
    render(
      <CollapseList title='목록' displaySuffix={false}>
        내용
      </CollapseList>
    );
    expect(screen.queryByTestId('chevron-down')).toBeNull();
    expect(screen.queryByTestId('chevron-up')).toBeNull();
  });

  test('PrefixIcon이 렌더링된다', () => {
    render(
      <CollapseList title='목록' PrefixIcon={<svg data-testid='prefix' />}>
        내용
      </CollapseList>
    );
    expect(screen.getByTestId('prefix')).toBeTruthy();
  });
});
