import { Metadata } from 'next';
import PartiesMain from '@/components/@features/Parties/PartiesMain';
import { PAGE_METADATA } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.PARTIES.index;

const PartiesPage = () => {
  return (
    <main>
      <PartiesMain />
    </main>
  );
};

export default PartiesPage;
