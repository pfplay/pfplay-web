'use client';
import { Fragment, useState } from 'react';
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

export type SelectOption = {
  label: string;
  value: string;
};

interface SelectProps {
  options: SelectOption[];
  initialValue?: SelectOption;
  classNames?: {
    container?: string;
    button?: string;
    options?: string;
  };
}

export default function Select({ options, initialValue, classNames }: SelectProps) {
  const [selected, setSelected] = useState<SelectOption>(initialValue ?? options[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <div className={cn('relative w-full', classNames?.container)}>
          <ListboxButton
            className={cn([
              'relative w-full h-12 flexRow justify-between items-center rounded bg-gray-800 px-4 text-gray-50 border-[1px] border-gray-500 cursor-pointer focus:outline-none',
              classNames?.button,
            ])}
          >
            <Typography type='detail1' overflow='ellipsis' className='w-5/6 text-left'>
              {selected.label}
            </Typography>
            <span>{open ? <PFChevronUp /> : <PFChevronDown />}</span>
          </ListboxButton>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <ListboxOptions
              className={cn([
                'absolute max-h-[264px] w-full mt-2 py-3 overflow-auto rounded bg-gray-800 border-[1px] border-gray-500 focus:outline-none',
                classNames?.options,
              ])}
            >
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  className={({ focus }) =>
                    cn('relative cursor-pointer px-4 py-3', focus && 'bg-gray-700')
                  }
                  value={option}
                >
                  <Typography type='detail1' overflow='ellipsis' className='text-gray-50'>
                    {option.label}
                  </Typography>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
