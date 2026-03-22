import { PropsWithChildren } from 'react';
import { Header } from '@/widgets/layouts';

const SettingsLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default SettingsLayout;
