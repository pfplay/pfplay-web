'use client';
import { PartyroomMutationFormModel } from '@/entities/partyroom-info';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { renderBr } from '@/shared/lib/localization/split-render';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFEdit } from '@/shared/ui/icons';
import PartyroomEditForm from './form.component';

type Props = {
  defaultValues: PartyroomMutationFormModel;
};

export default function Trigger({ defaultValues }: Props) {
  const t = useI18n();
  const lang = useLang();
  const { openDialog, openConfirmDialog } = useDialog();

  const handleClick = () => {
    openDialog((_, onCancel) => ({
      title: 'Edit Party', // TODO: i18n
      titleAlign: 'left',
      showCloseIcon: true,
      closeConfirm: () => {
        return openConfirmDialog({
          content: renderBr(t.party.para.stop_editing),
        });
      },
      classNames: {
        container: lang === Language.Ko ? 'w-[800px]' : 'w-[900px]',
      },
      Body: () => <PartyroomEditForm onSuccess={onCancel} defaultValues={defaultValues} />,
    }));
  };

  return (
    <Button size='sm' color='primary' variant='outline' Icon={<PFEdit />} onClick={handleClick}>
      {t.common.btn.edit}
    </Button>
  );
}
