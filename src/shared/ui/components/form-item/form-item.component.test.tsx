import { render, screen } from '@testing-library/react';
import FormItem, { FormItemError } from './form-item.component';

vi.mock('../typography', () => ({
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

describe('FormItem 반응형 레이아웃', () => {
  test('horizontal(기본): 모바일 단일칼럼 + tablet:부터 2칼럼 그리드', () => {
    const { container } = render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.className).toContain('tablet:grid-cols-[max-content_1fr]');
    expect(label?.className).not.toMatch(/(^|\s)grid-cols-\[max-content_1fr\]/);
  });

  test('horizontal: 라벨 정렬이 모바일 text-start / tablet:text-right', () => {
    const { container } = render(
      <FormItem label='이름'>
        <input />
      </FormItem>
    );
    const labelText = container.querySelector('[data-custom-role="form-item-title"]');
    expect(labelText).not.toBeNull();
    expect(labelText?.className).toContain('text-start');
    expect(labelText?.className).toContain('tablet:text-right');
  });

  test('vertical: 항상 세로(2칼럼 그리드 없음) + text-start, tablet:text-right 없음(불변)', () => {
    const { container } = render(
      <FormItem label='이름' layout='vertical'>
        <input />
      </FormItem>
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.className).not.toContain('grid-cols-[max-content');
    const labelText = container.querySelector('[data-custom-role="form-item-title"]');
    expect(labelText).not.toBeNull();
    expect(labelText?.className).toContain('text-start');
    expect(labelText?.className).not.toContain('tablet:text-right');
  });

  test('fit=true horizontal: tablet:부터 max-content 2칼럼 (모바일 단일칼럼)', () => {
    const { container } = render(
      <FormItem label='이름' fit>
        <input />
      </FormItem>
    );
    const label = container.querySelector('label');
    expect(label).not.toBeNull();
    expect(label?.className).toContain('tablet:grid-cols-[max-content_max-content]');
    expect(label?.className).not.toMatch(/(^|\s)grid-cols-\[max-content_max-content\]/);
  });

  test('horizontal + error: 스페이서 div가 hidden tablet:block (모바일 빈 행 방지)', () => {
    const { container } = render(
      <FormItem label='이름' error='필수 항목입니다'>
        <input />
      </FormItem>
    );
    const spacer = Array.from(container.querySelectorAll('div')).find((d) =>
      d.className.includes('tablet:block')
    );
    expect(spacer).toBeTruthy();
  });
});
