import { Fragment, ReactElement, ReactNode, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { cn } from '@/shared/lib/functions/cn';
import { PFChevronDown, PFChevronUp } from '@/shared/ui/icons';
import { Typography } from '../typography';

export type SelectOption<T> = {
  /**
   * @default String(value)
   */
  key?: string;
  value: T;
  label: ReactNode;
  prefix?: ReactElement;
  suffix?: ReactElement;
};

interface SelectProps<T> {
  options: SelectOption<T>[];
  defaultValue?: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function Select<T>({ options, defaultValue, onChange, className }: SelectProps<T>) {
  const [localValue, setLocalValue] = useState<T | undefined>(defaultValue);
  const selectedOption = localValue && options.find((option) => option.value === localValue);

  const handleChange = (value: T) => {
    setLocalValue(value);
    onChange(value);
  };

  return (
    <Listbox defaultValue={defaultValue} onChange={handleChange}>
      {({ open }) => (
        <div className={cn('relative w-full', className)}>
          <ListboxButton
            className={
              'relative w-full h-12 flex items-center gap-2 rounded bg-gray-800 px-4 text-gray-50 border-[1px] border-gray-500 cursor-pointer focus:outline-none'
            }
          >
            {renderOptionInner(selectedOption)}
            <span>{open ? <PFChevronUp /> : <PFChevronDown />}</span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <ListboxOptions
              className={
                'absolute max-h-[264px] w-full mt-2 py-3 overflow-auto rounded bg-gray-800 border-[1px] border-gray-500 focus:outline-none'
              }
            >
              {options.map((option) => (
                <ListboxOption
                  key={String(option.value)}
                  className={({ focus }) =>
                    cn('relative cursor-pointer px-4 py-3', focus && 'bg-gray-700')
                  }
                  value={option.value}
                >
                  {renderOptionInner(option)}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

function renderOptionInner(option: SelectOption<unknown> | undefined) {
  return (
    <div className='flex-1 flex items-center gap-2 min-w-0'>
      {option && (
        <>
          {option.prefix}

          <Typography type='detail1' overflow='ellipsis' className='flex-1 text-left text-gray-50'>
            {option.label}
          </Typography>

          {option.suffix}
        </>
      )}
    </div>
  );
}
