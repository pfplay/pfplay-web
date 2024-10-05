'use client';
import {
  ComponentProps,
  ReactNode,
  useRef,
  MouseEventHandler,
  FocusEventHandler,
  ChangeEventHandler,
  forwardRef,
  useState,
  KeyboardEventHandler,
} from 'react';
import { cn } from '@/shared/lib/functions/cn';
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
      defaultValue = '',
      onChange,
      maxLength,
      size = 'md',
      variant = 'filled',
      Prefix,
      Suffix,
      onFocus,
      onBlur,
      onPressEnter,
      classNames: { container: containerClassName, input: inputClassName } = {},
      ...rest
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
    const [localValue, setLocalValue] = useState(defaultValue);
    const value = _value ?? localValue;

    const handleClickWrapper: MouseEventHandler<HTMLDivElement> = (e) => {
      if (!(e.target as HTMLElement).closest('button')) {
        inputRef?.focus();
      }
    };
    const handleFocusInput: FocusEventHandler<HTMLInputElement> = (e) => {
      onFocus?.(e);
      wrapperRef.current?.classList.add('interaction-outline');
    };
    const handleBlurInput: FocusEventHandler<HTMLInputElement> = (e) => {
      onBlur?.(e);
      wrapperRef.current?.classList.remove('interaction-outline');
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
        ref={wrapperRef}
        onClick={handleClickWrapper}
        className={cn([
          'relative max-w-full flex items-center px-[12px] rounded-[4px] cursor-text',
          sizeDict[size],
          variantDict[variant],
          containerClassName,
        ])}
      >
        {Prefix && <div className='mr-[12px]'>{Prefix}</div>}

        <input
          ref={(node) => {
            setInputRef(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type='text'
          className={cn(
            'flex-1 bg-transparent placeholder:gray-400 text-gray-50 caret-red-300 focus:outline-none',
            inputClassName
          )}
          value={value}
          onChange={handleChangeInput}
          onFocus={handleFocusInput}
          onBlur={handleBlurInput}
          onKeyDown={handleKeyDownInput}
          {...rest}
        />

        {Number.isInteger(maxLength) && (
          <Typography className={cn('text-gray-400 ml-[12px]', !!value.length && 'text-gray-50')}>
            <strong
              className={cn({
                'text-red-300': maxLength && value.length > maxLength,
              })}
            >
              {String(value.length).padStart(String(maxLength).length, '0')}
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
