import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useGetMyServiceEntry } from '@/entities/me';
import UsersService from '@/shared/api/http/services/users';
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
              onClick={async () => {
                await UsersService.temporary_SignInFullMember();
                onClose?.();
                router.push(await getMyServiceEntry());
              }}
            >
              Full
            </Dialog.Button>
            <Dialog.Button
              onClick={async () => {
                await UsersService.temporary_SignInAssociateMember();
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
