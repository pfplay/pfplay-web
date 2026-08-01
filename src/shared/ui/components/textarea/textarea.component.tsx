'use client';
import {
  ComponentProps,
  ChangeEvent,
  ChangeEventHandler,
  useState,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import { cn } from '@/shared/lib/functions/cn';
import { combineRef } from '@/shared/lib/functions/combine-ref';
import { Typography } from '../typography';

export interface TextAreaProps extends Omit<ComponentProps<'textarea'>, 'value' | 'className'> {
  initialValue?: string;
  classNames?: {
    container?: string;
    textarea?: string;
  };
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      initialValue = '',
      onChange,
      placeholder,
      maxLength,
      classNames: { container: containerClassName, textarea: textareaClassName } = {},
      ...rest
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState<string>(initialValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const combinedRef = combineRef([ref, textareaRef]);

    const onChangeRef = useRef(onChange);
    const valueRef = useRef(localValue);
    useEffect(() => {
      onChangeRef.current = onChange;
      valueRef.current = localValue;
    });

    /**
     * #487: Input 과 동일 — React 합성 onChange 를 거치지 못한 입력은 DOM 에만 남고
     * 상태·폼에는 반영되지 않아 조용히 사라진다. (a) 하이드레이션 이전 타이핑,
     * (b) value 직접 대입 후 input 이벤트(fill 등, React value tracker 가 건너뜀).
     */
    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;

      const adopt = (event?: Event) => {
        const domValue = el.value;
        if (domValue === (valueRef.current ?? '')) return;
        setLocalValue(domValue);
        onChangeRef.current?.(
          (event ?? {
            target: el,
            currentTarget: el,
          }) as unknown as ChangeEvent<HTMLTextAreaElement>
        );
      };

      // 마운트 흡수는 "DOM 에 값이 있는데 상태가 비어 있는" 방향만 — 반대 방향(초기값이
      // 상태에만 있는 정상 상태)까지 삼키면 initialValue 가 지워진다.
      if (el.value) adopt();

      const handleNativeInput = () => {
        const domValue = el.value;
        window.setTimeout(() => {
          if (el.value === domValue && domValue !== (valueRef.current ?? '')) adopt();
        }, 0);
      };

      el.addEventListener('input', handleNativeInput);
      return () => el.removeEventListener('input', handleNativeInput);
       
    }, []);

    const handleChangeTextArea: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      setLocalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn('flex flex-col gap-1 max-w-full', containerClassName)}>
        <textarea
          ref={combinedRef}
          className={cn(
            'flex-1 min-h-max p-[12px] rounded-[4px]',
            'bg-gray-700 text-gray-50 placeholder:gray-400 caret-red-300',
            'focus:interaction-outline',
            textareaClassName
          )}
          placeholder={placeholder}
          onChange={handleChangeTextArea}
          {...rest}
        />

        {Number.isInteger(maxLength) && (
          <Typography
            className={cn('self-end', {
              'text-gray-400': !localValue.length,
              'text-gray-50': !!localValue.length,
            })}
          >
            <strong
              className={cn({
                'text-red-300': maxLength && localValue.length > maxLength,
              })}
            >
              {String(localValue.length).padStart(String(maxLength).length, '0')}
            </strong>
            /{maxLength}
          </Typography>
        )}
      </div>
    );
  }
);

export default TextArea;
