import { useCurrentPartyroom } from '@/entities/current-partyroom';
import { Dialog } from '@/shared/ui/components/dialog';
import Body from '@/widgets/partyroom-djing-dialog/ui/body.component';
import EmptyBody from './empty-body.component';

type Props = {
  open: boolean;
  close: () => void;
};

export default function DjingDialog({ open, close }: Props) {
  const { djing } = useCurrentPartyroom();

  if (!djing.current) {
    return (
      <Dialog
        open={open}
        onClose={close}
        classNames={{ container: containerClassName }}
        Body={<EmptyBody onCancel={close} />}
      />
    );
  }
  return (
    <Dialog
      open={open}
      onClose={close}
      classNames={{ container: containerClassName }}
      Body={<Body onCancel={close} />}
    />
  );
}

const containerClassName = 'w-[800px] py-[36px] px-[40px] bg-black';
