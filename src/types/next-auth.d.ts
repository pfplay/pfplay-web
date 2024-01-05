import { Authority } from '@/api/@types/@enums';
import { UserPermission } from '@/api/@types/User';

// NOTE: User, JWT 인터페이스는 UserLoginResponse + 'email' + 'accessToken' 이며,
// extends 키워드를 사용 안하고 중복을 감수하며 복붙해서 쓴 이유는 스레드 내용 참고 >> https://pfplay.slack.com/archives/C051ZQSV205/p1692028191063429

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    // NOTE:
    id: number;
    name: string;
    registered: boolean;
    authority: Authority;
    email: string;
    accessToken: string;
    userPermission: UserPermission;
    profileUpdated: boolean;
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: number;
    name: string;
    registered: boolean;
    authority: Authority;
    email: string;
    accessToken: string;
    userPermission: UserPermission;
    profileUpdated: boolean;
  }
}
