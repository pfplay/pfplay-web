import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { Dialog } from '@/shared/ui/components/dialog';
import Body from './body.component';
import EmptyBody from './empty-body.component';
import { DjingQueueContext } from '../lib/djing-queue.context';
import { PartyroomIdContext } from '../lib/partyroom-id.context';

type Props = {
  partyroomId: number;
  open: boolean;
  close: () => void;
};

export default function DjingDialog({ partyroomId, open, close }: Props) {
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId }, open);

  if (!djingQueue) return;

  const hasDj = !!djingQueue.djs.length;

  return (
    <Dialog
      open={open}
      onClose={close}
      classNames={{
        container: hasDj
          ? 'w-[800px] py-[36px] px-[40px] bg-black'
          : 'w-[520px] py-[36px] px-[40px]',
      }}
      Body={
        <PartyroomIdContext.Provider value={partyroomId}>
          <DjingQueueContext.Provider value={djingQueue}>
            {hasDj ? <Body onCancel={close} /> : <EmptyBody onCancel={close} />}
          </DjingQueueContext.Provider>
        </PartyroomIdContext.Provider>
      }
    />
  );
}
