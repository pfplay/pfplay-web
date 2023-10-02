'use client';
import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { PFChevronDown, PFChevronUp } from '@/components/@shared/@icons';
import { cn } from '@/utils/cn';
import Typography from './@atoms/Typography';

export type SelectListItem = {
  label: string;
  value: string;
};

interface SelectProps {
  selectListConfig: Array<SelectListItem>;
  initialValue?: SelectListItem;
  classNames?: {
    container?: string;
    selectButton?: string;
    optionPanel?: string;
  };
}

export const Select = ({ selectListConfig, initialValue, classNames }: SelectProps) => {
  const [selected, setSelected] = useState<SelectListItem>(initialValue ?? selectListConfig[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <div className={cn('relative w-full', classNames?.container)}>
          <Listbox.Button
            className={cn([
              'relative w-full h-12 flexRow justify-between items-center rounded bg-gray-800 px-4 text-gray-50 border-[1px] border-gray-500 cursor-pointer focus:outline-none',
              classNames?.selectButton,
            ])}
          >
            <Typography type='detail1' overflow='ellipsis' className='w-5/6 text-left'>
              {selected.label}
            </Typography>
            <span>{open ? <PFChevronUp /> : <PFChevronDown />}</span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options
              className={cn([
                'absolute max-h-[264px] w-full mt-2 py-3 overflow-auto rounded bg-gray-800 border-[1px] border-gray-500 focus:outline-none',
                classNames?.optionPanel,
              ])}
            >
              {selectListConfig.map((config) => (
                <Listbox.Option
                  key={config.value}
                  className={({ active }) =>
                    cn('relative cursor-pointer px-4 py-3', active && 'bg-gray-700')
                  }
                  value={config}
                >
                  <Typography type='detail1' overflow='ellipsis' className='text-gray-50'>
                    {config.label}
                  </Typography>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

export default Select;
