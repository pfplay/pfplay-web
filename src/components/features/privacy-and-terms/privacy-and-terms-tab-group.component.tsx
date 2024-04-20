'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { privacyAndTermsTabsConfig } from '@/constants/privacy-and-terms/privacy-and-terms-tabs-config';
import { cn } from '@/shared/lib/functions/cn';
import { AppLink } from '@/shared/lib/router/app-link.component';
import { Tab, TabGroup, TabList } from '@/shared/ui/components/tab';

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
          <AppLink key={config.index} href={config.href} replace>
            <Tab tabTitle='서비스 이용약관' variant='line' />
          </AppLink>
        ))}
        <div className='flex-1 border-b-[1px] border-b-gray-400 hidden mobile:block' />
      </TabList>
      {children}
    </TabGroup>
  );
};

export default PrivacyAndTermsTabGroup;
