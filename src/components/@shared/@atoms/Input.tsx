'use client';
import { ComponentProps, useEffect, useState, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends ComponentProps<'input'> {
  value: string;
  placeholder: string;
  maxLen?: number;
  icon?: ReactNode;
  button?: ReactNode;
  error?: boolean;
}

const Input = ({
  value,
  placeholder,
  maxLen,
  icon,
  button,
  error = false,
}: React.PropsWithChildren<InputProps>) => {
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
    <div className='flex items-center gap-[4px] bg-gray-700 rounded-[4px] p-[12px] [&>svg]:w-[24px] [&>svg]:h-[24px]'>
      {icon}
      <input
        className={cn(
          'flex-1 bg-transparent placeholder-gray-400 text-gray-50 caret-red-300 focus:outline-none'
        )}
        placeholder={placeholder}
        value={value}
      />
      {maxLen && (
        <div>
          <span
            className={cn('text-gray-400', isFilled && 'text-gray-50', error && 'text-red-300')}
          >
            {currentLen}
          </span>
          <span className={cn('text-gray-400', isFilled && 'text-gray-50')}>{`/${maxLen}`}</span>
        </div>
      )}
      {button}
    </div>
  );
};

export default Input;
