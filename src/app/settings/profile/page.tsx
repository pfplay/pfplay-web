import { headers } from 'next/headers';
import { ProfileEditFormV1 } from '@/features/edit-profile-bio';
import { MobileProfileEditForm } from '@/features-mobile/profile';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { BackButton } from '@/shared/ui/components/back-button';
import { Typography } from '@/shared/ui/components/typography';

const ProfileSettingsPage = async () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const t = await getServerDictionary();

  if (isMobile) {
    return (
      <div className='flexCol w-full min-h-screen pt-[var(--header-height)]'>
        <Typography type='title2' as='h1' className='text-white px-app pt-6'>
          {t.settings.title.who_r_u}
        </Typography>
        <MobileProfileEditForm />
      </div>
    );
  }

  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text={t.settings.title.who_r_u} className='absolute self-start top-10' />
      <ProfileEditFormV1 />
    </div>
  );
};

export default ProfileSettingsPage;
