'use client';
import React, { Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { cn } from '@/utils/cn';
import Typography from './Typography';

interface CommonProps {
  tabTitle: string;
}
interface BoxProps {
  variant?: 'box';
  onSwitchPrefixIconColor: (selected: boolean) => JSX.Element;
}
interface NonBoxProps {
  variant?: 'line' | 'text';
}
export type CustomTabProps = CommonProps & (BoxProps | NonBoxProps);

const CustomTab = (props: CustomTabProps) => {
  if (props.variant === 'box') {
    return (
      <Tab as={Fragment}>
        {({ selected }) => (
          <button
            className={cn(
              getCommentTabStyle(selected),
              props.variant === 'box' && 'py-[13px] px-[47px] bg-black text-gray-50',
              props.variant === 'box' && !selected && 'text-gray-500'
            )}
          >
            {props.onSwitchPrefixIconColor(selected)}
            <Typography type={'body1'} className='capitalize'>
              {props.tabTitle}
            </Typography>
          </button>
        )}
      </Tab>
    );
  }

  return (
    <Tab
      className={({ selected }) =>
        cn(
          getCommentTabStyle(selected),
          props.variant === 'line' && !selected && 'text-gray-400',
          props.variant === 'line' && 'py-[9px] px-[24px] bg-transparent',
          props.variant === 'text' && 'py-[9px] px-[12px] border-none',
          props.variant === 'text' && !selected && 'text-gray-300'
        )
      }
    >
      <Typography type={props.variant === 'text' ? 'detail1' : 'body1'} className='capitalize'>
        {props.tabTitle}
      </Typography>
    </Tab>
  );
};

export default CustomTab;

const getCommentTabStyle = (selected: boolean) => {
  return cn(
    'flexRowCenter gap-[6px] outline-none border-b-[1px] border-gray-400',
    selected && 'text-red-300 border-red-300'
  );
};

export const TabGroup = Tab.Group;
export const TabList = Tab.List;
export const TabPanels = Tab.Panels;
export const TabPanel = Tab.Panel;
