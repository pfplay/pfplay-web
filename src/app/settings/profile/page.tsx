import { ProfileEditFormV1 } from '@/features/edit-profile-bio';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { BackButton } from '@/shared/ui/components/back-button';

const ProfileSettingsPage = async () => {
  const t = await getServerDictionary();

  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text={t.settings.title.who_r_u} className='absolute self-start top-10' />
      <ProfileEditFormV1 />
    </div>
  );
};

export default ProfileSettingsPage;
