import { render, screen } from '@testing-library/react';
import FormItem, { FormItemError } from './form-item.component';

jest.mock('../typography', () => ({
  Typography: ({ children, className, ...rest }: any) => (
    <span className={className} {...rest}>
      {children}
    </span>
  ),
}));

describe('FormItem', () => {
  test('문자열 label이 렌더링된다', () => {
    render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );

    expect(screen.getByText('이름')).toBeTruthy();
  });

  test('ReactNode label이 렌더링된다', () => {
    render(
      <FormItem label={<strong>커스텀 라벨</strong>}>
        <input />
      </FormItem>
    );

    expect(screen.getByText('커스텀 라벨')).toBeTruthy();
  });

  test('children이 렌더링된다', () => {
    render(
      <FormItem label='이름'>
        <input placeholder='입력하세요' />
      </FormItem>
    );

    expect(screen.getByPlaceholderText('입력하세요')).toBeTruthy();
  });

  test('error 문자열이 표시된다', () => {
    render(
      <FormItem label='이름' error='필수 항목입니다'>
        <input />
      </FormItem>
    );

    expect(screen.getByText('필수 항목입니다')).toBeTruthy();
  });

  test('error가 boolean true일 때 에러 메시지는 표시되지 않지만 에러 스타일은 적용된다', () => {
    const { container } = render(
      <FormItem label='이름' error={true}>
        <input />
      </FormItem>
    );

    const childWrapper = container.querySelector('.outline-red-300');
    expect(childWrapper).not.toBeNull();
  });

  test('error가 없으면 에러 영역이 렌더링되지 않는다', () => {
    const { container } = render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );

    expect(container.querySelector('.outline-red-300')).toBeNull();
  });

  test('required일 때 label에 필수 마커 클래스가 적용된다', () => {
    const { container } = render(
      <FormItem label='이름' required>
        <input />
      </FormItem>
    );

    const labelEl = container.querySelector('[data-custom-role="form-item-title"]');
    expect(labelEl).not.toBeNull();
    expect(labelEl?.className).toContain('after:content-["*"]');
  });
});

describe('FormItemError', () => {
  test('에러 메시지를 렌더링한다', () => {
    render(<FormItemError>오류가 발생했습니다</FormItemError>);
    expect(screen.getByText('오류가 발생했습니다')).toBeTruthy();
  });
});
