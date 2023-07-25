export { default } from 'next-auth/middleware';

// Protected route는 matcher에 path 추가
export const config = {
  matcher: ['/profile/:path*', '/avatar/:path*'],
};
