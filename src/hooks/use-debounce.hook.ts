import React, { useRef, useState } from 'react';

type UseDebounceOptions = {
  interval?: number;
};

/**
 * @example
 * const { value, handleChange } = useDebounce((debouncedValue) => {
 *  // do something with debounce value
 * });
 *
 * <input value={value} onChange={handleChange} />
 *
 */
export const useDebounce = (
  callback?: (value: string) => void,
  { interval = 500 }: UseDebounceOptions = {}
) => {
  const [value, setInputValue] = useState<string>('');
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      callback?.(newValue);
    }, interval);
  };

  return {
    value,
    handleChange,
  };
};
