import { Dialog } from '@/shared/ui/components/dialog';
import { useFetchDjingQueue } from '@/widgets/partyroom-djing-dialog/api/use-fetch-djing-queue.query';
import Body from './body.component';
import EmptyBody from './empty-body.component';
import { PartyroomIdContext } from '../lib/partyroom-id.context';

type Props = {
  partyroomId: number;
  open: boolean;
  close: () => void;
};

export default function DjingDialog({ partyroomId, open, close }: Props) {
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId }, open);

  if (!djingQueue) return;
  return (
    <Dialog
      open={open}
      onClose={close}
      classNames={{ container: 'w-[800px] py-[36px] px-[40px] bg-black' }}
      Body={
        <PartyroomIdContext.Provider value={partyroomId}>
          {djingQueue.djs.length ? (
            <Body djingQueue={djingQueue} onCancel={close} />
          ) : (
            <EmptyBody onCancel={close} />
          )}
        </PartyroomIdContext.Provider>
      }
    />
  );
}
