import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFParty } from '@/shared/ui/icons';
import PanelHeader from './panel-header.component';
import PanelMain from './panel-main.component';

export default function PartyRoomListTrigger() {
  const t = useI18n();

  const { openDialog } = useDialog();

  const handleOpen = () => {
    return openDialog((_onOk, onCancel) => ({
      classNames: {
        container: 'bg-gray-900 w-[65vw] max-w-[964px] p-0 px-12',
      },
      Body: (
        <>
          {onCancel && <PanelHeader onClose={onCancel} />}
          <PanelMain />
        </>
      ),
    }));
  };

  return (
    <div className='relative'>
      <Button
        color='secondary'
        variant='outline'
        Icon={<PFParty widths={20} height={20} className='[&_*]:fill-gray-300' />}
        size='sm'
        className='text-gray-50 w-full'
        onClick={handleOpen}
      >
        {t.party.title.party_list}
      </Button>
    </div>
  );
}
