import { FC, PropsWithChildren } from 'react';

const MobileNoticeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main className='bg-onboarding min-h-screen flexColCenter px-6'>{children}</main>;
};

export default MobileNoticeLayout;
