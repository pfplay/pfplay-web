import ProfileSettingForm from '@/components/features/profile/profile-setting-form.component';
import BackButton from '@/shared/ui/components/back-button/back-button.component';

const ProfileSettingsPage = () => {
  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text='당신은 누구신가요?' className='absolute self-start top-10' />
      <ProfileSettingForm />
    </div>
  );
};

export default ProfileSettingsPage;
