import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { default as useSignInMutation } from '../api/use-sign-in.mutation';

type Props = {
  onSuccess: () => void;
};

export default function useSignIn({ onSuccess }: Props) {
  const { openDialog } = useDialog();
  const t = useI18n();
  const { mutate, isPending } = useSignInMutation();

  return () => {
    return openDialog((_, onClose) => ({
      showCloseIcon: true,
      title: t.onboard.title.moment,
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          {t.onboard.para.guest_limit}
        </Typography>
      ),
      Body: () => (
        <Dialog.ButtonGroup>
          <Dialog.Button
            className='w-[50%]'
            color='secondary'
            onClick={() => {
              mutate(undefined, {
                onSuccess,
                onSettled: () => {
                  onClose?.();
                },
              });
            }}
            loading={isPending}
          >
            {t.onboard.btn.guest}
          </Dialog.Button>
          <Dialog.Button
            className='w-[50%]'
            onClick={() => {
              onClose?.();
            }}
            disabled={isPending}
          >
            {t.auth.btn.back_to_sign_in}
          </Dialog.Button>
        </Dialog.ButtonGroup>
      ),
      classNames: {
        container: 'w-[550px] pb-[50px]',
      },
    }));
  };
}
