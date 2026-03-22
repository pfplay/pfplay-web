'use client';
import { ReactNode } from 'react';
import { PartyroomMutationFormModel } from '@/entities/partyroom-info';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { LineBreakProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import { PFEdit } from '@/shared/ui/icons';
import PartyroomEditForm from './form.component';

type Props = {
  defaultValues: PartyroomMutationFormModel;
  sub: ReactNode;
};

export default function Trigger({ defaultValues, sub }: Props) {
  const t = useI18n();
  const lang = useLang();
  const { openDialog, openConfirmDialog } = useDialog();

  const handleClick = () => {
    openDialog((_, onCancel) => ({
      title: t.party.title.party_edit,
      titleAlign: 'left',
      showCloseIcon: true,
      closeConfirm: () => {
        return openConfirmDialog({
          content: (
            <Trans i18nKey='party.para.stop_editing' processors={[new LineBreakProcessor()]} />
          ),
        });
      },
      classNames: {
        container: lang === Language.Ko ? 'w-[800px]' : 'w-[900px]',
      },
      Body: () => (
        <PartyroomEditForm onSuccess={onCancel} defaultValues={defaultValues} sub={sub} />
      ),
    }));
  };

  return (
    <Button size='sm' color='primary' variant='outline' Icon={<PFEdit />} onClick={handleClick}>
      {t.common.btn.edit}
    </Button>
  );
}
