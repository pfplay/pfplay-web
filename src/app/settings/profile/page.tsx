import { headers } from 'next/headers';
import { ProfileEditFormV1 } from '@/features/edit-profile-bio';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { BackButton } from '@/shared/ui/components/back-button';
import { MobileOnlyDesktopFeatureCard } from '@/shared/ui/components/mobile-only-desktop-feature-card';

const ProfileSettingsPage = async () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileOnlyDesktopFeatureCard feature='profile-edit' />;

  const t = await getServerDictionary();

  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text={t.settings.title.who_r_u} className='absolute self-start top-10' />
      <ProfileEditFormV1 />
    </div>
  );
};

export default ProfileSettingsPage;
