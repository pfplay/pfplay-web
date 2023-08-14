import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { login } from './login';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID ?? '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET ?? '',
      authorization: {
        params: {
          redirect_uri: process.env.NEXT_LOGIN_REDIRECT_URI,
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
    // 구글로그인 성공 후 callback (백엔드에 email을 요청하고 access_token을 받아옴)
    signIn: async ({ user, account }) => {
      try {
        const response = await login(account?.access_token);
        if (response) {
          user.accessToken = response.headers.authorization;
          user.registered = response.data.data.registered;
          user.authority = response.data.data.authority;
          user.id = String(response.data.data.id);
          user.name = response.data.data.name;
        }

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    // 구글 로그인 성공 후 callback (백엔드에 access_token 전달)
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user?.accessToken;
        token.registered = user?.registered;
        token.authority = user?.authority;
        token.id = user?.id;
        token.name = user?.name;
      }

      return token;
    },
    // session: 어플리케이션에서 사용할 최종 auth 정보
    session: ({ session, token }) => {
      session.user.accessToken = token.accessToken as string;
      session.user.registered = token.registered;
      session.user.authority = token.authority;
      session.user.id = token.id;
      session.user.name = token.name;

      return session;
    },
  },
};

// 서버에서 세션을 가져오는 함수
export const getAuthSession = () => getServerSession(authOptions);
