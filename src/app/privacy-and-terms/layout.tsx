import React, { PropsWithChildren } from 'react';

const PrivacyAndTermsLayout = ({ children }: PropsWithChildren) => {
  return <main className='bg-black px-app flexColCenter'>{children}</main>;
};

export default PrivacyAndTermsLayout;
