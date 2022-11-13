import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SessionWithAuth } from 'type/auth';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID ?? '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET ?? '',
    }),
  ],
  callbacks: {
    // token: 구글 로그인을 통해 받은 정보 (user, access_token)
    jwt: async ({ token, account }) => {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },
    // session: 어플리케이션에서 사용할 최종 auth 정보
    session: ({ session, token }) => {
      const newSession: SessionWithAuth = session;
      if (token?.access_token) {
        newSession.access_token = token.access_token as string;
      }
      return session;
    },
  },
});
