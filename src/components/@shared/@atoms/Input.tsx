'use client';
import {
  ComponentProps,
  ReactNode,
  FC,
  ChangeEventHandler,
  useRef,
  MouseEventHandler,
  FocusEventHandler,
} from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';

type InputSize = 'md' | 'lg';
type InputVariant = 'filled' | 'outlined';
export interface InputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'size' | 'className'> {
  value: string;
  onChange: (v: string) => void;
  size?: InputSize;
  variant?: InputVariant;
  Prefix?: ReactNode;
  Suffix?: ReactNode;
  classNames?: {
    container?: string;
    input?: string;
  };
}

const Input: FC<InputProps> = ({
  value,
  onChange,
  maxLength,
  size = 'md',
  variant = 'filled',
  Prefix,
  Suffix,
  onFocus,
  onBlur,
  classNames: { container: containerClassName, input: inputClassName } = {},
  ...rest
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClickWrapper: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!(e.target as HTMLElement).closest('button')) {
      inputRef.current?.focus();
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
    onChange(e.target.value);
  };

  return (
    <div
      ref={wrapperRef}
      onClick={handleClickWrapper}
      className={cn([
        'max-w-full flex items-center px-[12px] rounded-[4px] cursor-text',
        sizeDict[size],
        variantDict[variant],
        containerClassName,
      ])}
    >
      {Prefix && <div className='mr-[12px]'>{Prefix}</div>}

      <input
        ref={inputRef}
        maxLength={maxLength}
        type='text'
        className={cn(
          'flex-1 bg-transparent placeholder:gray-400 text-gray-50 caret-red-300 focus:outline-none',
          inputClassName
        )}
        value={value}
        onChange={handleChangeInput}
        onFocus={handleFocusInput}
        onBlur={handleBlurInput}
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
};

const sizeDict: Record<InputSize, string> = {
  md: 'h-[48px]',
  lg: 'h-[56px]',
};
const variantDict: Record<InputVariant, string> = {
  filled: 'bg-gray-700',
  outlined: 'bg-transparent border border-gray-500',
};

export default Input;
