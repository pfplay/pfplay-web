import useCanUnlockDjingQueue from './use-can-unlock-djing-queue.hook';
import { default as useUnlockDjingQueueMutation } from '../api/use-unlock-djing-queue.mutation';

export default function useUnlockDjingQueue() {
  const { mutate } = useUnlockDjingQueueMutation();
  const canUnlockDjingQueue = useCanUnlockDjingQueue();

  return async () => {
    if (!canUnlockDjingQueue) return;

    mutate();
  };
}
