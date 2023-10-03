import { Metadata } from 'next';

import AvatarSettingForm from '@/components/@features/Avatar/AvatarSettingForm';
import { PAGE_METADATA } from '@/utils/routes';

export const metadata: Metadata = PAGE_METADATA.SETTINGS.AVATAR.index;

const AvatarSettingsPage = () => {
  return <AvatarSettingForm withLayout />;
};

export default AvatarSettingsPage;
