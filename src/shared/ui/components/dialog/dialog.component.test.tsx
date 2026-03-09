import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dialog from './dialog.component';

vi.mock('../typography', () => ({
  Typography: ({ children }: any) => <span>{children}</span>,
  TypographyType: {},
}));

vi.mock('../button', () => ({
  Button: ({ children, ...rest }: any) => <button {...rest}>{children}</button>,
  ButtonProps: {},
}));

vi.mock('@/shared/ui/components/text-button', () => ({
  TextButton: ({ onClick, Icon }: any) => (
    <button data-testid='close-icon' onClick={onClick}>
      {Icon}
    </button>
  ),
}));

vi.mock('@/shared/ui/icons', () => ({
  PFClose: () => <svg data-testid='pf-close' />,
}));

vi.mock('@/shared/ui/foundation/theme', () => ({
  __esModule: true,
  default: { zIndex: { dialog: 50 } },
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

describe('Dialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    Body: <div>바디 내용</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('open=true일 때 Body가 렌더링된다', () => {
    render(<Dialog {...defaultProps} />);
    expect(screen.getByText('바디 내용')).toBeTruthy();
  });

  test('open=false일 때 Body가 렌더링되지 않는다', () => {
    render(<Dialog {...defaultProps} open={false} />);
    expect(screen.queryByText('바디 내용')).toBeNull();
  });

  test('문자열 title이 렌더링된다', () => {
    render(<Dialog {...defaultProps} title='다이얼로그 제목' />);
    expect(screen.getByText('다이얼로그 제목')).toBeTruthy();
  });

  test('함수형 title이 렌더링된다', () => {
    render(
      <Dialog
        {...defaultProps}
        title={(props) => <h3 className={props.defaultClassName}>커스텀 제목</h3>}
      />
    );
    expect(screen.getByText('커스텀 제목')).toBeTruthy();
  });

  test('Body가 FC일 때 렌더링된다', () => {
    const BodyComponent = () => <div>함수형 바디</div>;
    render(<Dialog {...defaultProps} Body={BodyComponent} />);
    expect(screen.getByText('함수형 바디')).toBeTruthy();
  });

  test('showCloseIcon=true일 때 닫기 아이콘이 표시된다', () => {
    render(<Dialog {...defaultProps} title='제목' showCloseIcon />);
    expect(screen.getByTestId('close-icon')).toBeTruthy();
  });

  test('닫기 아이콘 클릭 시 onClose가 호출된다', async () => {
    const onClose = vi.fn();
    render(<Dialog {...defaultProps} title='제목' showCloseIcon onClose={onClose} />);

    fireEvent.click(screen.getByTestId('close-icon'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('Sub가 렌더링된다', () => {
    render(<Dialog {...defaultProps} title='제목' Sub={<span>부제목</span>} />);
    expect(screen.getByText('부제목')).toBeTruthy();
  });
});

describe('Dialog.ButtonGroup / Dialog.Button', () => {
  test('ButtonGroup이 children을 렌더링한다', () => {
    render(
      <Dialog.ButtonGroup>
        <span>버튼들</span>
      </Dialog.ButtonGroup>
    );
    expect(screen.getByText('버튼들')).toBeTruthy();
  });

  test('Dialog.Button이 children을 렌더링한다', () => {
    render(<Dialog.Button>확인</Dialog.Button>);
    expect(screen.getByText('확인')).toBeTruthy();
  });
});
