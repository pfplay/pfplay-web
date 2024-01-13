'use client';
import React from 'react';
import TermsOfService from '@/components/features/PrivacyAndTerms/TermsOfService';
import SuspenseWithErrorBoundary from '@/components/shared/SuspenseWithErrorBoundary';
import {
  TabGroup,
  TabList,
  CustomTab,
  TabPanels,
  TabPanel,
} from '@/components/shared/atoms/CustomTab';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

const TermsOfServicePage = () => {
  return (
    <>
      <Typography type='title1' className='text-white'>
        PFPlay 이용약관 및 개인정보 처리방침
      </Typography>
      <div className='w-full flexCol'>
        <TabGroup>
          <TabList className={cn('w-full flexRow')}>
            <CustomTab tabTitle='서비스 이용약관' variant='line' />
            <CustomTab tabTitle='개인정보 처리방침' variant='line' />
            <div className='flex-1 border-b-[1px] border-b-gray-400' />
          </TabList>
          <TabPanels className={'pb-2'}>
            <TabPanel tabIndex={0} className='pt-6'>
              <SuspenseWithErrorBoundary>
                <TermsOfService />
              </SuspenseWithErrorBoundary>
            </TabPanel>
            <TabPanel tabIndex={1} className={' pt-4 '}>
              {/* <PrivacyPolicy /> */}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </>
  );
};

export default TermsOfServicePage;
