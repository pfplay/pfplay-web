'use client';
import {
  ComponentProps,
  ReactNode,
  FC,
  ChangeEventHandler,
  useRef,
  FocusEventHandler,
  MouseEventHandler,
} from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';

export interface InputProps
  extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'maxLength'> {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  Prefix?: ReactNode;
  Suffix?: ReactNode;
}

const Input: FC<InputProps> = ({
  value,
  onChange,
  maxLength,
  Prefix,
  Suffix,
  onFocus,
  onBlur,
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
        'h-[48px] px-[12px] flex items-center rounded-[4px]',
        'bg-gray-700 cursor-text',
        '[&>svg]:w-[24px] [&>svg]:h-[24px]',
      ])}
    >
      {Prefix && <div className='mr-[12px]'>{Prefix}</div>}

      <input
        ref={inputRef}
        type='text'
        className={
          'flex-1 bg-transparent placeholder:gray-400 text-gray-50 caret-red-300 focus:outline-none'
        }
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

export default Input;
