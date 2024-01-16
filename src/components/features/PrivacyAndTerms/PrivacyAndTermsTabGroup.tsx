'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { privacyAndTermsTabsConfig } from '@/constants/privacyAndTerms/privacyAndTermsTabsConfig';
import { cn } from '@/utils/cn';
import { AppLink } from '../../shared/Router/AppLink';
import { CustomTab, TabGroup, TabList } from '../../shared/atoms/CustomTab';

interface PrivacyAndTermsTabGroupProps {
  children: ReactNode;
}
const PrivacyAndTermsTabGroup = ({ children }: PrivacyAndTermsTabGroupProps) => {
  const pathname = usePathname();

  const selectedIndex =
    privacyAndTermsTabsConfig.find((config) => config.href === pathname)?.index || 0;

  return (
    <TabGroup selectedIndex={selectedIndex}>
      <TabList className={cn('w-full flexRow justify-center ')}>
        {privacyAndTermsTabsConfig.map((config) => (
          <AppLink key={config.index} href={config.href}>
            <CustomTab tabTitle='서비스 이용약관' variant='line' />
          </AppLink>
        ))}
        <div className='flex-1 border-b-[1px] border-b-gray-400 hidden mobile:block' />
      </TabList>
      {children}
    </TabGroup>
  );
};

export default PrivacyAndTermsTabGroup;
