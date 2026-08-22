import { act, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './input.component';

vi.mock('../typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

vi.mock('@/shared/lib/functions/combine-ref', () => ({
  combineRef: (refs: any[]) => (el: any) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(el);
      else if (ref && typeof ref === 'object') ref.current = el;
    });
  },
}));

describe('Input', () => {
  test('기본 렌더링 — input 요소가 존재한다', () => {
    render(<Input placeholder='테스트' />);

    expect(screen.getByPlaceholderText('테스트')).toBeTruthy();
  });

  test('비제어 모드: defaultValue 설정 후 타이핑하면 value가 변경된다', () => {
    render(<Input defaultValue='초기값' placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력') as HTMLInputElement;
    expect(input.value).toBe('초기값');

    fireEvent.change(input, { target: { value: '새로운 값' } });
    expect(input.value).toBe('새로운 값');
  });

  test('제어 모드: value prop이 반영된다', () => {
    render(<Input value='제어값' placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력') as HTMLInputElement;
    expect(input.value).toBe('제어값');
  });

  test('maxLength 카운터가 0/10 형식으로 표시된다', () => {
    const { container } = render(<Input maxLength={10} placeholder='입력' />);

    expect(container.textContent).toContain('/10');
    expect(container.textContent).toContain('00');
  });

  test('maxLength 초과 시 빨간색 카운터 클래스가 적용된다', () => {
    const { container } = render(<Input value='12345678901' maxLength={10} placeholder='입력' />);

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect((strong as HTMLElement).className).toContain('text-red-300');
  });

  test('Enter 키를 누르면 onPressEnter 콜백이 호출된다', () => {
    const onPressEnter = vi.fn();
    render(<Input onPressEnter={onPressEnter} placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력');
    fireEvent.keyDown(input, { key: 'Enter', nativeEvent: { isComposing: false } });

    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  test('Prefix와 Suffix가 렌더링된다', () => {
    render(<Input Prefix={<span>접두사</span>} Suffix={<span>접미사</span>} placeholder='입력' />);

    expect(screen.getByText('접두사')).toBeTruthy();
    expect(screen.getByText('접미사')).toBeTruthy();
  });

  // #487: 서버 마크업이 하이드레이션되기 전에 사용자가 친 값은 DOM 에만 존재한다.
  // React 가 마운트하며 상태값으로 덮으면 그 입력은 조용히 사라진다("글자가 안 써진다").
  // 차단(비활성)이 아니라 복구 — 마운트 시점의 DOM 값을 상태로 흡수해야 한다.
  test('#487: 하이드레이션 이전에 입력된 값이 마운트 후에도 남고 onChange 로 전파된다', async () => {
    // RHF 처럼 값을 되돌려주는 제어 부모 (onChange 를 무시하면 제어 컴포넌트 특성상
    // DOM 값이 부모 값으로 덮이는 게 정상이라, 실제 폼과 같은 구조로 확인한다)
    const ControlledHost = ({ onValue }: { onValue: (v: string) => void }) => {
      const [value, setValue] = useState('');
      return (
        <Input
          value={value}
          onChange={(e) => {
            onValue(e.target.value);
            setValue(e.target.value);
          }}
          placeholder='입력'
        />
      );
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<ControlledHost onValue={() => {}} />);

    const input = container.querySelector('input') as HTMLInputElement;
    // 하이드레이션 전 사용자 타이핑 (React 는 이 입력을 모른다)
    input.value = '하이드레이션전입력';

    const onChange = vi.fn();
    await act(async () => {
      hydrateRoot(container, <ControlledHost onValue={onChange} />);
    });

    try {
      expect(input.value).toBe('하이드레이션전입력');
      expect(onChange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith('하이드레이션전입력');
    } finally {
      container.remove();
    }
  });

  test('wrapper 클릭 시 input이 포커스된다', () => {
    const { container } = render(<Input placeholder='입력' />);

    const input = screen.getByPlaceholderText('입력');
    const wrapper = container.firstElementChild as HTMLElement;

    const focusSpy = vi.spyOn(input, 'focus');
    fireEvent.click(wrapper);

    expect(focusSpy).toHaveBeenCalled();
    focusSpy.mockRestore();
  });

  // #487 (b): value 를 직접 대입한 뒤 input 이벤트가 오면 React 의 value tracker 가
  // "변경 없음" 으로 판단해 onChange 를 건너뛴다(Playwright fill 이 실제로 이 모양이다).
  // 그 결과 DOM 에는 글자가 있는데 폼 상태는 비어 제출 버튼이 계속 비활성이 된다.
  test('#487: value 직접 대입 + input 이벤트도 상태로 흡수된다(onChange 유실 복구)', async () => {
    const onValue = vi.fn();
    const ControlledHost = () => {
      const [value, setValue] = useState('');
      return (
        <Input
          value={value}
          onChange={(e) => {
            onValue(e.target.value);
            setValue(e.target.value);
          }}
          placeholder='입력'
        />
      );
    };

    render(<ControlledHost />);
    const input = screen.getByPlaceholderText('입력') as HTMLInputElement;

    await act(async () => {
      input.value = 'fill주입값'; // React 합성 이벤트를 우회한 값 주입
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onValue).toHaveBeenCalledWith('fill주입값');
    expect(input.value).toBe('fill주입값');
  });
});
