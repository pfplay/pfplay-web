import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { getServerAuthSession } from '@/utils/next-auth-options';

const ProtectedLayout = async ({ children }: PropsWithChildren) => {
  const session = await getServerAuthSession();

  /**
   * 로그인은 했지만 프로필을 아직 생성하지 않은 경우
   */
  if (session && !session.user.profileUpdated) {
    redirect('/settings/profile');
  }

  return <>{children}</>;
};

export default ProtectedLayout;
