'use client';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/shared/ui/components/dialog';

// TODO: 디자인 나오면 api error handling 수정과 함께 재 수정
export default function Error({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <Dialog
      title={error.message}
      Body={
        <Dialog.ButtonGroup>
          <Dialog.Button onClick={() => router.back()}>Go back</Dialog.Button>
        </Dialog.ButtonGroup>
      }
      open
      onClose={() => router.back()}
    />
  );
}
