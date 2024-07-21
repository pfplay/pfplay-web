import { useCurrentPartyroom } from '@/entities/current-partyroom';
import { Dialog } from '@/shared/ui/components/dialog';
import Body from './body.component';
import EmptyBody from './empty-body.component';

type Props = {
  open: boolean;
  close: () => void;
};

export default function DjingDialog({ open, close }: Props) {
  const { djing } = useCurrentPartyroom();

  return (
    <Dialog
      open={open}
      onClose={close}
      classNames={{ container: 'w-[800px] py-[36px] px-[40px] bg-black' }}
      Body={djing.current ? <Body onCancel={close} /> : <EmptyBody onCancel={close} />}
    />
  );
}
