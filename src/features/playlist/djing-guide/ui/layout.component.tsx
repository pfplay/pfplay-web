import { useState } from 'react';
import { useUserPreferenceStore } from '@/entities/preference';
import { Preference } from '@/entities/preference/model/user-preference.model';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import Guide1 from './guide-1.component';
import Guide2 from './guide-2.component';
import Guide3 from './guide-3.component';
import Paginator from './paginator.component';

type Props = {
  onClose: () => void;
};

export default function DjingGuideLayout({ onClose }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const t = useI18n();
  const setDjingGuideHidden = useUserPreferenceStore(
    (s: Preference.Model) => s.setDjingGuideHidden
  );

  const isLastPage = currentPage === 3;

  const moveNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleDontShowAgain = () => {
    setDjingGuideHidden(true);
    onClose();
  };

  return (
    <div>
      {currentPage === 1 && <Guide1 />}
      {currentPage === 2 && <Guide2 />}
      {currentPage === 3 && <Guide3 />}
      <div className='flex justify-between mt-[20px]'>
        <button className='text-gray-400 w-[150px]' onClick={handleDontShowAgain}>
          {t.common.btn.dont_show_again}
        </button>
        <Paginator totalPages={3} currentPage={currentPage} />
        <div className='w-[150px] flex justify-end'>
          <Button onClick={isLastPage ? onClose : moveNextPage}>{t.common.btn.confirm}</Button>
        </div>
      </div>
    </div>
  );
}
