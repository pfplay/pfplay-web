'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { privacyAndTermsTabsConfig } from '@/constants/privacyAndTerms/privacyAndTermsTabsConfig';
import { cn } from '@/utils/cn';
import { CustomTab, TabGroup, TabList } from './CustomTab';
import { AppLink } from '../Router/AppLink';

interface LinkTabProps {
  children: ReactNode;
}
const PrivacyAndTermsTabGroup = ({ children }: LinkTabProps) => {
  const pathname = usePathname();

  const selectedIndex =
    privacyAndTermsTabsConfig.find((config) => config.href === pathname)?.index || 0;

  return (
    <TabGroup selectedIndex={selectedIndex}>
      <TabList className={cn('w-full flexRow')}>
        {privacyAndTermsTabsConfig.map((config) => (
          <AppLink key={config.index} href={config.href}>
            <CustomTab tabTitle='서비스 이용약관' variant='line' />
          </AppLink>
        ))}
        <div className='flex-1 border-b-[1px] border-b-gray-400' />
      </TabList>
      {children}
    </TabGroup>
  );
};

export default PrivacyAndTermsTabGroup;
