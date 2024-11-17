import { useRouter } from 'next/navigation';
import { useFetchMe } from '@/entities/me';
import { useSignOut } from '@/features/sign-out';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useChangeLanguage } from '@/shared/lib/localization/use-change-language.hook';
import useLanguages from '@/shared/lib/localization/use-languages.hook';
import { Button } from '@/shared/ui/components/button';
import { type DialogTitleProps, useDialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export default function useOpenSettingDialog() {
  const { openDialog } = useDialog();
  const { data: me } = useFetchMe();

  return () => {
    return openDialog((onOk) => ({
      title: Title,
      titleAlign: 'center',
      Sub: me && (
        <Typography type='detail1' className='text-white'>
          {me.email}
        </Typography>
      ),
      showCloseIcon: true,
      classNames: {
        container: 'w-[420px] py-8 px-10 bg-gray-800',
      },
      Body: () => <Body closeDialog={onOk} />,
    }));
  };
}

function Title({ defaultTypographyType, defaultClassName }: DialogTitleProps) {
  const t = useI18n();

  return (
    <Typography type={defaultTypographyType} className={defaultClassName}>
      {t.common.btn.settings}
    </Typography>
  );
}

function Body({ closeDialog }: { closeDialog: () => void }) {
  const t = useI18n();
  const languages = useLanguages();
  const changeLanguage = useChangeLanguage();
  const signOut = useSignOut();
  const router = useRouter();

  const buttons = [
    {
      text: t.common.btn.home,
      onClick: () => {
        router.push('/');
        closeDialog();
      },
    },
    {
      text: t.common.btn.view_guide,
      onClick: () => {
        // TODO: Implement guide page, 기능 문의 중 - https://pfplay.slack.com/archives/C03QTFBU8QG/p1731840284145439
        alert('Not implemented yet');
      },
    },
    {
      text: t.common.btn.logout,
      onClick: async () => {
        await signOut();
        closeDialog();
      },
    },
  ];

  return (
    <>
      <div className='w-full flexCol gap-3'>
        {buttons.map((button) => (
          <Button
            key={`setting-button-${button.text}`}
            onClick={button.onClick}
            size='lg'
            color='secondary'
            variant='fill'
            className='w-full'
          >
            {button.text}
          </Button>
        ))}
      </div>

      <div className='flexRowCenter gap-5 mt-7'>
        <Typography type='detail1' className='text-gray-200'>
          Language{/* TODO: i18n */}
        </Typography>

        <div className='flex gap-3'>
          {languages.map((language) => (
            <Button
              key={`language-button-${language.value}`}
              onClick={() => changeLanguage(language.value)}
              size='sm'
              color={language.isCurrent ? 'primary' : 'secondary'}
              variant='outline'
            >
              {language.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
