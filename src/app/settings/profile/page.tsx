import { ProfileEditFormV1 } from '@/features/edit-profile-bio';
import { BackButton } from '@/shared/ui/components/back-button';

const ProfileSettingsPage = () => {
  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text='당신은 누구신가요?' className='absolute self-start top-10' />
      <ProfileEditFormV1 />
    </div>
  );
};

export default ProfileSettingsPage;
