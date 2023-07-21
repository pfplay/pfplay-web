import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { login } from './login';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID ?? '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET ?? '',
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
    signIn: async ({ user }) => {
      try {
        const response = await login(user.email);

        if (response) {
          const access_token = response.data.access_token;
          user.accessToken = access_token;
        }

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    // token: 구글 로그인을 통해 받은 정보 (user, access_token)
    jwt: async ({ token, user }) => {
      if (user?.accessToken) {
        token.accessToken = user?.accessToken;
      }
      return token;
    },
    // session: 어플리케이션에서 사용할 최종 auth 정보
    session: ({ session, token }) => {
      if (token?.accessToken) {
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

// 서버에서 세션을 가져오는 함수
export const getAuthSession = () => getServerSession(authOptions);
