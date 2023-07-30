import { DefaultSession } from 'next-auth';

interface CustomUser {
  userId: number;
  email: string;
  name: string;
  accessToken: string;
  isRegistered: boolean;
  // TODO: 권한 타입 정의
  authority: string;
}

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends CustomUser {}

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: CustomUser & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends CustomUser {}
}
