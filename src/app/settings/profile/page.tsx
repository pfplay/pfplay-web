import { Metadata } from 'next';

import ProfileSettingForm from '@/components/features/Profile/ProfileSettingForm';
import BackButton from '@/components/shared/BackButton';
import { PAGE_METADATA } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.SETTINGS.PROFILE.index;

const ProfileSettingsPage = () => {
  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text='당신은 누구신가요?' className='absolute self-start top-10' />
      <ProfileSettingForm />
    </div>
  );
};

export default ProfileSettingsPage;
