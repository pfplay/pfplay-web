import { FC, PropsWithChildren } from 'react';

const MaintenanceLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main className='bg-black min-h-screen flexColCenter'>{children}</main>;
};

export default MaintenanceLayout;
