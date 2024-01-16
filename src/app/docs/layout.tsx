import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';
import { AppLink } from '@/components/shared/Router/AppLink';
import {
  TabGroup,
  TabList,
  CustomTab,
  TabPanels,
  TabPanel,
} from '@/components/shared/atoms/CustomTab';
import Typography from '@/components/shared/atoms/Typography';
import { cn } from '@/utils/cn';

const PrivacyAndTermsLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header withLogo />
      <main className='bg-black px-app flexCol py-[160px] gap-[60px]'>
        <Typography type='title1' className='text-white'>
          PFPlay 이용약관 및 개인정보 처리방침
        </Typography>
        <div className='w-full flexCol'>
          <TabGroup>
            <TabList className={cn('w-full flexRow')}>
              <AppLink href='/docs/terms-of-service'>
                <CustomTab tabTitle='서비스 이용약관' variant='line' />
              </AppLink>
              <AppLink href='/docs/privacy-policy'>
                <CustomTab tabTitle='개인정보 처리방침' variant='line' />
              </AppLink>
              <div className='flex-1 border-b-[1px] border-b-gray-400' />
            </TabList>
            <TabPanels className={'pb-2'}>
              <TabPanel tabIndex={0} className='pt-6'>
                {children}
              </TabPanel>
              <TabPanel tabIndex={1} className={'pt-4'}>
                {children}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </main>
    </>
  );
};

export default PrivacyAndTermsLayout;
