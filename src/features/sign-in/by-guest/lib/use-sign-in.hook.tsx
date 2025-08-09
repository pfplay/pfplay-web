import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { default as useSignInMutation } from '../api/use-sign-in.mutation';

type Props = {
  onSuccess: () => void;
  onClickSignInByGoogle: () => void;
  onClickSignInByTwitter: () => void;
};

export default function useSignIn({
  onSuccess,
  onClickSignInByGoogle,
  onClickSignInByTwitter,
}: Props) {
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
          <Dialog.Button onClick={onClickSignInByGoogle} disabled={isPending}>
            {t.auth.btn.connect_google}
          </Dialog.Button>
          <Dialog.Button onClick={onClickSignInByTwitter} disabled={isPending}>
            트위터 연동하기 (임시)
          </Dialog.Button>
          <Dialog.Button
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
        </Dialog.ButtonGroup>
      ),
      classNames: {
        container: 'w-[550px]',
      },
    }));
  };
}
