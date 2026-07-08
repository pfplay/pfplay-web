import { headers } from 'next/headers';
import { NotificationToggle } from '@/features/push-notification';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { BackButton } from '@/shared/ui/components/back-button';
import { Typography } from '@/shared/ui/components/typography';

const NotificationSettingsPage = async () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const t = await getServerDictionary();

  if (isMobile) {
    return (
      <div className='flexCol w-full min-h-screen pt-[var(--header-height)]'>
        <Typography type='title2' as='h1' className='text-white px-app pt-6'>
          {t.settings.notifications.title}
        </Typography>
        <div className='px-app pt-6'>
          <NotificationToggle />
        </div>
      </div>
    );
  }

  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text={t.settings.notifications.title} className='absolute self-start top-10' />
      <div className='w-full max-w-[480px]'>
        <NotificationToggle />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
