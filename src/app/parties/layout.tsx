import { Metadata } from 'next';
import Header from '@/components/@features/Home/Header';
import { PAGE_METADATA } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.PARTIES.index;

const PartiesLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Header />
      {/* TODO: layout 정리되면  추가  */}
      <main className='min-w-laptop  px-[120px] desktop:px-[80px]  py-[140px] pb-[120px] bg-black  overflow-y-auto'>
        {children}
      </main>
    </>
  );
};

export default PartiesLayout;
