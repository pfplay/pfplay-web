'use client';
import {
  ComponentProps,
  ReactNode,
  MouseEventHandler,
  ChangeEvent,
  ChangeEventHandler,
  forwardRef,
  useState,
  KeyboardEventHandler,
  useRef,
  useEffect,
} from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { combineRef } from '@/shared/lib/functions/combine-ref';
import { Typography } from '../typography';

type InputSize = 'md' | 'lg';
type InputVariant = 'filled' | 'outlined';

export interface InputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'defaultValue' | 'value' | 'size' | 'className'> {
  defaultValue?: string;
  value?: string;
  size?: InputSize;
  variant?: InputVariant;
  Prefix?: ReactNode;
  Suffix?: ReactNode;
  onPressEnter?: () => void;
  classNames?: {
    container?: string;
    input?: string;
  };
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value: _value,
      defaultValue,
      onChange,
      maxLength,
      size = 'md',
      variant = 'filled',
      Prefix,
      Suffix,
      onPressEnter,
      classNames: { container: containerClassName, input: inputClassName } = {},
      ...rest
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = combineRef([ref, inputRef]);

    const [localValue, setLocalValue] = useState(defaultValue);
    const value = _value ?? localValue;
    const valueLength = value?.length ?? 0;

    // 아래 복구 로직이 항상 최신 값·핸들러를 보도록 동기화한다(네이티브 이벤트는
    // 렌더 사이에 도착하므로 클로저 캡처로는 스테일해진다).
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    useEffect(() => {
      onChangeRef.current = onChange;
      valueRef.current = value;
    });

    /**
     * #487: 입력값은 React 합성 onChange 를 거쳐야만 상태에 남는다. 그 경로를 타지 못한
     * 입력은 DOM 에만 존재하고 상태·폼(RHF)은 빈 값이라, 글자수 카운터는 00 이고 제출
     * 버튼은 계속 비활성이다 — 사용자 눈에는 "글자가 안 써진다".
     * 확인된 경로 2가지:
     *   (a) 하이드레이션 이전 타이핑 — React 가 마운트하기 전이라 핸들러가 없다.
     *   (b) value 를 직접 대입한 뒤 input 이벤트가 오는 경우 — React 의 value tracker 가
     *       "변경 없음"으로 보고 건너뛴다. 자동화 도구의 fill 이 이 모양이고, 값을 직접
     *       채우는 확장·자동완성도 같은 경로가 될 수 있다.
     * 입력을 막는 대신(막으면 사용자만 손해다) 유실을 감지해 상태로 흡수한다.
     */
    useEffect(() => {
      const el = inputRef.current;
      if (!el) return;

      const adopt = (event?: Event) => {
        const domValue = el.value;
        if (domValue === (valueRef.current ?? '')) return;
        setLocalValue(domValue);
        onChangeRef.current?.(
          (event ?? { target: el, currentTarget: el }) as unknown as ChangeEvent<HTMLInputElement>
        );
      };

      // (a) 마운트 시점에 이미 들어와 있던 값. "DOM 에 값이 있는데 상태가 빈" 방향만
      // 흡수한다 — 반대 방향(defaultValue 가 상태에만 있는 정상 상태)은 건드리지 않는다.
      if (el.value) adopt();

      // (b) React 가 처리했는지 다음 매크로태스크에 확인하고, 놓친 경우에만 흡수한다
      const handleNativeInput = () => {
        const domValue = el.value;
        window.setTimeout(() => {
          if (el.value === domValue && domValue !== (valueRef.current ?? '')) adopt();
        }, 0);
      };

      el.addEventListener('input', handleNativeInput);
      return () => el.removeEventListener('input', handleNativeInput);
       
    }, []);

    const handleClickWrapper: MouseEventHandler<HTMLDivElement> = (e) => {
      if (!(e.target as HTMLElement).closest('button')) {
        inputRef.current?.focus();
      }
    };

    const handleChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => {
      setLocalValue(e.target.value);
      onChange?.(e);
    };

    const handleKeyDownInput: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (
        e.key === 'Enter' &&
        !e.nativeEvent.isComposing /* NOTE: isComposing일 땐 Enter가 두 번 트리거됩니다 */
      ) {
        onPressEnter?.();
      }
    };

    return (
      <div
        onClick={handleClickWrapper}
        className={cn([
          'relative max-w-full flex items-center px-[12px] rounded-[4px] cursor-text focus-within:interaction-outline',
          sizeDict[size],
          variantDict[variant],
          containerClassName,
        ])}
      >
        {Prefix && <div className='mr-[12px]'>{Prefix}</div>}

        <input
          ref={combinedRef}
          type='text'
          className={cn(
            'flex-1 min-w-0 bg-transparent placeholder:gray-400 text-gray-50 caret-red-300 focus:outline-none',
            inputClassName
          )}
          value={value}
          onChange={handleChangeInput}
          onKeyDown={handleKeyDownInput}
          {...rest}
        />

        {Number.isInteger(maxLength) && (
          <Typography className={cn('text-gray-400 ml-[12px]', { 'text-gray-50': !!valueLength })}>
            <strong
              className={cn({
                'text-red-300': maxLength && valueLength > maxLength,
              })}
            >
              {String(valueLength).padStart(String(maxLength).length, '0')}
            </strong>
            /{maxLength}
          </Typography>
        )}

        {Suffix && <div className='ml-[8px]'>{Suffix}</div>}
      </div>
    );
  }
);

const sizeDict: Record<InputSize, string> = {
  md: 'h-[48px]',
  lg: 'h-[56px]',
};
const variantDict: Record<InputVariant, string> = {
  filled: 'bg-gray-700',
  outlined: 'bg-transparent border border-gray-500',
};

export default Input;
