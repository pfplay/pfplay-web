import { render, screen, fireEvent } from '@testing-library/react';
import Drawer from './drawer.component';

jest.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@/shared/ui/components/text-button', () => ({
  TextButton: ({ onClick, Icon }: any) => (
    <button data-testid='close-button' onClick={onClick}>
      {Icon}
    </button>
  ),
}));

jest.mock('@/shared/ui/icons', () => ({
  PFClose: () => <svg data-testid='pf-close' />,
}));

jest.mock('@/shared/lib/hooks/use-portal-root.hook', () => ({
  __esModule: true,
  default: () => document.body,
}));

describe('Drawer', () => {
  test('isOpen=true일 때 children이 렌더링된다', () => {
    render(
      <Drawer isOpen title='서랍'>
        <div>서랍 내용</div>
      </Drawer>
    );

    expect(screen.getByText('서랍 내용')).toBeTruthy();
  });

  test('isOpen=false일 때 children이 렌더링되지 않는다', () => {
    render(
      <Drawer isOpen={false} title='서랍'>
        <div>서랍 내용</div>
      </Drawer>
    );

    expect(screen.queryByText('서랍 내용')).toBeNull();
  });

  test('title이 렌더링된다', () => {
    render(
      <Drawer isOpen title='제목입니다'>
        <div>내용</div>
      </Drawer>
    );

    expect(screen.getByText('제목입니다')).toBeTruthy();
  });

  test('close 콜백이 있으면 닫기 버튼이 표시된다', () => {
    render(
      <Drawer isOpen title='서랍' close={jest.fn()}>
        <div>내용</div>
      </Drawer>
    );

    expect(screen.getByTestId('close-button')).toBeTruthy();
  });

  test('닫기 버튼 클릭 시 close가 호출된다', () => {
    const close = jest.fn();
    render(
      <Drawer isOpen title='서랍' close={close}>
        <div>내용</div>
      </Drawer>
    );

    fireEvent.click(screen.getByTestId('close-button'));
    expect(close).toHaveBeenCalledTimes(1);
  });

  test('isOpen=true일 때 body에 scroll-hidden 클래스가 추가된다', () => {
    render(
      <Drawer isOpen title='서랍'>
        <div>내용</div>
      </Drawer>
    );

    expect(document.body.classList.contains('scroll-hidden')).toBe(true);
  });

  test('HeaderExtra가 렌더링된다', () => {
    render(
      <Drawer isOpen title='서랍' HeaderExtra={<span>추가 헤더</span>}>
        <div>내용</div>
      </Drawer>
    );

    expect(screen.getByText('추가 헤더')).toBeTruthy();
  });
});
