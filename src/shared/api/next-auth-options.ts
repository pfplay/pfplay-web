import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UserService } from '@/shared/api/services/user';

/**
 * @deprecated OAuth 로직 서버 측으로 이전될 예정
 */
export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? '',
      clientSecret: process.env.GOOGLE_SECRET ?? '',
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/callback/google`,
          response_type: 'code',
          scope: 'email',
        },
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    signIn: async ({ user, account }) => {
      try {
        if (!account) throw '"account" is null';
        if (!account.access_token) throw '"account.access_token" is undefined';

        const response = await UserService.login({
          accessToken: account.access_token,
        });

        user.accessToken = response.accessToken;
        user.registered = response.registered;
        user.authority = response.authority;
        user.id = response.id;
        user.name = response.name;
        user.userPermission = response.userPermission;
        user.profileUpdated = response.profileUpdated;

        return true;
      } catch (e) {
        return false;
      }
    },
    // 구글 로그인 성공 후 callback
    jwt: ({ token, user, trigger, session }) => {
      if (trigger === 'update') {
        return {
          ...token,
          ...session.user,
        };
      }

      if (!user) return token;

      token.accessToken = user.accessToken;
      token.registered = user.registered;
      token.authority = user.authority;
      token.id = user.id as number;
      token.name = user.name;
      token.userPermission = user.userPermission;
      token.profileUpdated = user.profileUpdated;

      return token;
    },
    // session: 어플리케이션에서 사용할 최종 auth 정보
    session: ({ session, token }) => {
      session.user.accessToken = token.accessToken;
      session.user.registered = token.registered;
      session.user.authority = token.authority;
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.userPermission = token.userPermission;
      session.user.profileUpdated = token.profileUpdated;

      return session;
    },
  },
};

/**
 * @deprecated OAuth 로직 서버 측으로 이전될 예정
 */
export const getServerAuthSession = () => getServerSession(nextAuthOptions);
