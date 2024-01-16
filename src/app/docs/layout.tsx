import { PropsWithChildren } from 'react';
import PrivacyAndTermsTabGroup from '@/components/features/PrivacyAndTerms/PrivacyAndTermsTabGroup';
import Header from '@/components/layouts/Header';
import { TabPanels, TabPanel } from '@/components/shared/atoms/CustomTab';
import Typography from '@/components/shared/atoms/Typography';
import { privacyAndTermsTabsConfig } from '@/constants/privacyAndTerms/privacyAndTermsTabsConfig';

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
