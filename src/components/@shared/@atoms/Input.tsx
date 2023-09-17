'use client';
import { ComponentProps, useEffect, useState, ReactNode, FC } from 'react';
import Typography from '@/components/@shared/@atoms/Typography';
import { cn } from '@/utils/cn';

export interface InputProps extends ComponentProps<'input'> {
  value: string;
  placeholder: string;
  max?: number;
  Icon?: ReactNode;
  Button?: ReactNode;
  error?: boolean;
}

const Input: FC<InputProps> = ({
  value,
  placeholder,
  max,
  Icon,
  Button,
  error = false,
  ...rest
}) => {
  const [currentLen, setCurrentLen] = useState(0);
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    if (currentLen !== value.length) {
      setCurrentLen(value.length);
    }
  }, [value]);

  useEffect(() => {
    if (currentLen !== 0) {
      return setIsFilled(true);
    }

    return setIsFilled(false);
  }, [currentLen]);

  return (
    <div className='h-[48px] flex items-center bg-gray-700 rounded-[4px] px-[12px] [&>svg]:w-[24px] [&>svg]:h-[24px]'>
      {Icon && <div className='mr-[12px]'>{Icon}</div>}

      <input
        className={cn(
          'flex-1 bg-transparent placeholder-gray-400 text-gray-50 caret-red-300 focus:outline-none'
        )}
        placeholder={placeholder}
        value={value}
        max={max}
        {...rest}
      />

      {max && (
        <Typography className={cn('text-gray-400 ml-[12px]', isFilled && 'text-gray-50')}>
          <strong className={cn('appearance-none', error && 'text-red-300')}>{currentLen}</strong>/
          {max}
        </Typography>
      )}

      {Button && <div className='ml-[8px]'>{Button}</div>}
    </div>
  );
};

export default Input;
