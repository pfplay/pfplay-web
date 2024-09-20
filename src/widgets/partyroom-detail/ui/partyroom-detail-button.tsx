import { useState } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { PFInfoOutline } from '@/shared/ui/icons';
import PartyroomDetailPanel from './partyroom-detail-panel';

export default function PartyroomDetailButton() {
  const t = useI18n();
  const [panelOpened, setPanelOpened] = useState(true);

  return (
    <div className='relative'>
      <Button
        color='secondary'
        variant='outline'
        Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
        size='sm'
        className='text-gray-50 w-full'
        onClick={() => setPanelOpened(true)}
      >
        {t.party.title.party_info}
      </Button>
      {panelOpened && <PartyroomDetailPanel onClose={() => setPanelOpened(false)} />}
    </div>
  );
}
