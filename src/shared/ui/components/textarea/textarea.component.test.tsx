import { act, createRef, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { render, screen, fireEvent } from '@testing-library/react';
import TextArea from './textarea.component';

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

describe('TextArea', () => {
  test('placeholder가 표시된다', () => {
    render(<TextArea placeholder='내용을 입력하세요' />);
    expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeTruthy();
  });

  test('initialValue가 카운터에 반영된다', () => {
    const { container } = render(
      <TextArea initialValue='가나다' maxLength={10} placeholder='입력' />
    );
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    // '가나다' length=3 → '03' (padStart)
    expect((strong as HTMLElement).textContent).toBe('03');
  });

  test('타이핑 시 onChange 콜백이 호출된다', () => {
    const onChange = vi.fn();
    render(<TextArea onChange={onChange} placeholder='입력' />);

    const textarea = screen.getByPlaceholderText('입력');
    fireEvent.change(textarea, { target: { value: '새 값' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('maxLength 설정 시 카운터가 표시된다', () => {
    const { container } = render(<TextArea maxLength={100} placeholder='입력' />);
    expect(container.textContent).toContain('/100');
  });

  test('maxLength 초과 시 빨간색 클래스가 적용된다', () => {
    const longText = 'a'.repeat(11);
    const { container } = render(
      <TextArea initialValue={longText} maxLength={10} placeholder='입력' />
    );

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect((strong as HTMLElement).className).toContain('text-red-300');
  });

  test('maxLength 미설정 시 카운터가 표시되지 않는다', () => {
    const { container } = render(<TextArea placeholder='입력' />);
    expect(container.querySelector('strong')).toBeNull();
  });

  test('ref가 textarea 요소에 전달된다', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea ref={ref} placeholder='입력' />);

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  // #487: 하이드레이션 이전 입력이 상태에 반영되지 않아 사라지는 결함의 복구 확인
  test('#487: 하이드레이션 이전에 입력된 값이 마운트 후에도 남고 onChange 로 전파된다', async () => {
    const ControlledHost = ({ onValue }: { onValue: (v: string) => void }) => {
      const [value, setValue] = useState('');
      return (
        <TextArea
          value={value}
          onChange={(e) => {
            onValue(e.target.value);
            setValue(e.target.value);
          }}
          placeholder='소개'
        />
      );
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<ControlledHost onValue={() => {}} />);

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '하이드레이션전소개';

    const onChange = vi.fn();
    await act(async () => {
      hydrateRoot(container, <ControlledHost onValue={onChange} />);
    });

    try {
      expect(textarea.value).toBe('하이드레이션전소개');
      expect(onChange).toHaveBeenCalledWith('하이드레이션전소개');
    } finally {
      container.remove();
    }
  });

  // #487 (b): value 직접 대입 + input 이벤트 → React 가 onChange 를 건너뛰는 경로
  test('#487: value 직접 대입 + input 이벤트도 상태로 흡수된다(onChange 유실 복구)', async () => {
    const onValue = vi.fn();
    const ControlledHost = () => {
      const [value, setValue] = useState('');
      return (
        <TextArea
          value={value}
          onChange={(e) => {
            onValue(e.target.value);
            setValue(e.target.value);
          }}
          placeholder='소개'
        />
      );
    };

    render(<ControlledHost />);
    const textarea = screen.getByPlaceholderText('소개') as HTMLTextAreaElement;

    await act(async () => {
      textarea.value = 'fill주입소개';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onValue).toHaveBeenCalledWith('fill주입소개');
    expect(textarea.value).toBe('fill주입소개');
  });
});
