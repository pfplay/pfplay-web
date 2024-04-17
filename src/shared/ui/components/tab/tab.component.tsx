'use client';
import { Fragment, JSX } from 'react';
import { Tab as HeadlessUITab } from '@headlessui/react';
import { cn } from '@/shared/lib/cn';
import Typography from '@/shared/ui/components/typography/typography.component';

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
export type TabProps = CommonProps & (BoxProps | NonBoxProps);

export const Tab = (props: TabProps) => {
  if (props.variant === 'box') {
    return (
      <HeadlessUITab as={Fragment}>
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
      </HeadlessUITab>
    );
  }

  return (
    <HeadlessUITab
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
    </HeadlessUITab>
  );
};

const getCommentTabStyle = (selected: boolean) => {
  return cn(
    'flexRowCenter gap-[6px] outline-none border-b-[1px] border-gray-400',
    selected && 'text-red-300 border-red-300'
  );
};

export const TabGroup = HeadlessUITab.Group;
export const TabList = HeadlessUITab.List;
export const TabPanels = HeadlessUITab.Panels;
export const TabPanel = HeadlessUITab.Panel;
