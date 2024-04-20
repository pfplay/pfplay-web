import { PropsWithChildren } from 'react';
import { privacyAndTermsTabsConfig } from '@/components/features/privacy-and-terms/privacy-and-terms-tabs-config';
import PrivacyAndTermsTabGroup from '@/components/features/privacy-and-terms/privacy-and-terms-tabs.component';
import { TabPanels, TabPanel } from '@/shared/ui/components/tab';
import { Typography } from '@/shared/ui/components/typography';
import Header from '@/shared/ui/layouts/header.component';

const PrivacyAndTermsLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header withLogo />
      <main className='bg-black px-3 mx-auto tablet:px-app  flexCol py-[160px] gap-[60px] max-w-desktop min-w-mobile'>
        <Typography type='title1' className='text-white' overflow='break-all'>
          PFPlay 이용약관 및 개인정보 처리방침
        </Typography>
        <div className='w-full flexCol'>
          <PrivacyAndTermsTabGroup>
            <TabPanels className={'pb-2'}>
              <TabPanel tabIndex={privacyAndTermsTabsConfig[0].index} className='pt-6'>
                {children}
              </TabPanel>
              <TabPanel tabIndex={privacyAndTermsTabsConfig[1].index} className={'pt-4'}>
                {children}
              </TabPanel>
            </TabPanels>
          </PrivacyAndTermsTabGroup>
        </div>
      </main>
    </>
  );
};

export default PrivacyAndTermsLayout;
