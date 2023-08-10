import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { AuthService } from '@/api/services/Auth';

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
  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
  callbacks: {
    // FIXME: 유진님 확인 필요. 현재 백엔드 스웨거 명세에 따르면 로그인 accessToken 을 전달해줘야 함. accessToken 은 구글에서 받아오고 그걸 백엔드로 전달하는건지? (주석이랑 명세랑 반대..?)
    // 구글로그인 성공 후 callback (백엔드에 email을 요청하고 access_token을 받아옴)
    signIn: async ({ user, account }) => {
      try {
        if (!account) throw 'account is null';
        if (!account.access_token) throw 'access_token is undefined';

        const response = await AuthService.login({
          access_token: account.access_token,
        });

        if (response) {
          user.accessToken = account.access_token;
          user.isRegistered = response.registered;
          user.authority = response.authority;
        }

        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    // token: 구글 로그인을 통해 받은 정보 (user, access_token)
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.isRegistered = user.isRegistered;
        token.authority = user.authority;
      }

      return token;
    },
    // session: 어플리케이션에서 사용할 최종 auth 정보
    session: ({ session, token }) => {
      session.user.accessToken = token.accessToken;
      session.user.isRegistered = token.isRegistered;
      session.user.authority = token.authority;

      return session;
    },
  },
};

// 서버에서 세션을 가져오는 함수
export const getAuthSession = () => getServerSession(authOptions);
