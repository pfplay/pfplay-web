import { useState } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Trans, LineBreakProcessor, VariableProcessor } from '@/shared/lib/localization/renderer';
import { useDialog } from '@/shared/ui/components/dialog';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { Input } from '@/shared/ui/components/input';
import { Typography } from '@/shared/ui/components/typography';
import useCanCloseCurrentPartyroom from '../api/use-can-close-current-partyroom.hook';
import useClosePartyroomMutation from '../api/use-close-partyroom.mutation';

export default function useClosePartyroom() {
  const { mutate } = useClosePartyroomMutation();
  const canCloseCurrentPartyroom = useCanCloseCurrentPartyroom();
  const openPartyroomCloseConfirmDialog = useOpenPartyroomCloseConfirmDialog();

  return async () => {
    if (!canCloseCurrentPartyroom) return;

    const confirmed = await openPartyroomCloseConfirmDialog();
    if (!confirmed) return;

    mutate();
  };
}

function useOpenPartyroomCloseConfirmDialog() {
  const t = useI18n();
  const matchForCloseParty = t.party.para.match_for_close_party;
  const { openDialog } = useDialog();

  return () => {
    return openDialog<boolean>((onOk) => ({
      title: ({ defaultTypographyType, defaultClassName }) => (
        <Typography type={defaultTypographyType} className={defaultClassName}>
          <Trans
            i18nKey='party.para.close_party'
            processors={[
              new LineBreakProcessor(),
              new VariableProcessor({ match: matchForCloseParty }),
            ]}
          />
        </Typography>
      ),
      Body: () => {
        const matchForCloseParty = t.party.para.match_for_close_party;

        const [inputValue, setInputValue] = useState('');
        const canClose = inputValue === matchForCloseParty;

        return (
          <>
            <Input
              placeholder={matchForCloseParty}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Dialog.ButtonGroup>
              <Dialog.Button color='secondary' onClick={() => onOk(false)}>
                {t.common.btn.cancel}
              </Dialog.Button>
              <Dialog.Button disabled={!canClose} onClick={() => onOk(true)}>
                {t.party.para.close}
              </Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        );
      },
    }));
  };
}
