'use client';
import { ComponentProps, Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';
import Icons from './Icons';
import Typography from './ui/Typography';

export type SelectListItem = {
  label: string;
  value: string;
};

interface SelectProps {
  width?: ComponentProps<'div'>['className'];
  PrefixIcon?: React.ReactNode;
  selectListConfig: Array<SelectListItem>;
  initialValue?: SelectListItem;
}

export const Select = ({ selectListConfig, width, PrefixIcon, initialValue }: SelectProps) => {
  const [selected, setSelected] = useState<SelectListItem>(initialValue ?? selectListConfig[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <div className={cn('relative w-full max-w-[332px]', width)}>
          <Listbox.Button className='relative w-full flexRow justify-between items-center rounded bg-grey-800 py-3 px-4 text-grey-50 border-[1px] border-grey-500 cursor-pointer focus:outline-none'>
            <span className='w-4/5 flexRow items-center gap-2'>
              {PrefixIcon && PrefixIcon}
              <Typography
                type='detail1'
                overflow='ellipsis'
                className={cn('w-5/6 text-left', PrefixIcon && 'w-3/5')}
              >
                {selected.label}
              </Typography>
            </span>
            <span>{open ? <Icons.arrowUp /> : <Icons.arrowDown />}</span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute max-h-[264px] w-full mt-2 py-3 overflow-auto rounded bg-grey-800 border-[1px] border-grey-500 focus:outline-none'>
              {selectListConfig.map((config) => (
                <Listbox.Option
                  key={config.value}
                  className={({ active }) =>
                    cn('relative cursor-pointer px-4 py-3', active && 'bg-grey-700')
                  }
                  value={config}
                >
                  <Typography type='detail1' overflow='ellipsis' className='text-grey-50'>
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
