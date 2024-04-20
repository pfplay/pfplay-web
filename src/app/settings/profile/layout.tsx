import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { getServerAuthSession } from '@/shared/api/next-auth-options';

const ProfileEditLayout = async ({ children }: PropsWithChildren) => {
  const session = await getServerAuthSession();

  /**
   * 프로필을 등록한 사용자의 경우, 접근 불가
   */
  if (session?.user.profileUpdated) {
    redirect('/parties');
  }
  return <>{children}</>;
};

export default ProfileEditLayout;
