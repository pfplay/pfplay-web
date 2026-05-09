import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useGetMyServiceEntry } from '@/entities/me';
import { usersService } from '@/shared/api/http/services';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Dialog, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useSignInForDev() {
  const t = useI18n();
  const { openDialog } = useDialog();
  const router = useRouter();
  const getMyServiceEntry = useGetMyServiceEntry();

  return useCallback(() => {
    openDialog((_, onClose) => ({
      showCloseIcon: true,
      title: t.onboard.title.moment,
      Sub: (
        <Typography type='detail1' className='text-gray-300'>
          개발용 로그인입니다. 로그인할 권한을 선택하세요.
        </Typography>
      ),
      Body: () => {
        return (
          <Dialog.ButtonGroup>
            <Dialog.Button
              color='secondary'
              data-testid='dev-sign-in-full'
              onClick={async () => {
                await usersService.temporary_SignInFullCrew();
                onClose?.();
                router.push(await getMyServiceEntry());
              }}
            >
              Full
            </Dialog.Button>
            <Dialog.Button
              data-testid='dev-sign-in-associate'
              onClick={async () => {
                await usersService.temporary_SignInAssociateCrew();
                onClose?.();
                router.push(await getMyServiceEntry());
              }}
            >
              Associate
            </Dialog.Button>
          </Dialog.ButtonGroup>
        );
      },
    }));
  }, [getMyServiceEntry, openDialog, router, t]);
}
