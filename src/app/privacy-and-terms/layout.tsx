import { PropsWithChildren } from 'react';
import Header from '@/components/layouts/Header';

const PrivacyAndTermsLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header withLogo />
      <main className='bg-black px-app flexCol py-[160px] gap-[60px]'>{children}</main>
    </>
  );
};

export default PrivacyAndTermsLayout;
