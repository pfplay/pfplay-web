import { headers } from 'next/headers';
import { PropsWithChildren } from 'react';
import ProfileEditRedirectGuard from './profile-edit-redirect-guard';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  const device = headers().get('x-pf-device') === 'mobile' ? 'mobile' : 'desktop';

  return <ProfileEditRedirectGuard device={device}>{children}</ProfileEditRedirectGuard>;
};

export default ProfileEditLayout;
