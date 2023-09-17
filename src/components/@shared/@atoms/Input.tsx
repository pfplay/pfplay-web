'use client';
import { ComponentProps, ReactNode, FC, ChangeEventHandler } from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';

export interface InputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'placeholder' | 'onChange' | 'maxLength'> {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLength?: number;
  Icon?: ReactNode;
  Button?: ReactNode;
}

const Input: FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  Icon,
  Button,
  ...rest
}) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className='h-[48px] flex items-center bg-gray-700 rounded-[4px] px-[12px] [&>svg]:w-[24px] [&>svg]:h-[24px]'>
      {Icon && <div className='mr-[12px]'>{Icon}</div>}

      <input
        className={cn(
          'flex-1 bg-transparent placeholder:gray-400 text-gray-50 caret-red-300 focus:outline-none'
        )}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...rest}
      />

      {Number.isInteger(maxLength) && (
        <Typography className={cn('text-gray-400 ml-[12px]', !!value.length && 'text-gray-50')}>
          <strong
            className={cn('font-normal', maxLength && value.length > maxLength && 'text-red-300')}
          >
            {value.length}
          </strong>
          /{maxLength}
        </Typography>
      )}

      {Button && <div className='ml-[8px]'>{Button}</div>}
    </div>
  );
};

export default Input;
