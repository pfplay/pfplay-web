export const routes = {
  home: '/',
  signin: '/sign-in',
  profile: {
    base: '/profile',
    settings: '/profile/settings',
    // TODO: setting과 edit에 관해서 각 use case마다 어떻게 구분할지 고민해보기
    edit: '/profile/edit',
  },
  avatar: {
    base: '/avatar',
    settings: '/avatar/settings',
    // TODO: setting과 edit에 관해서 각 use case마다 어떻게 구분할지 고민해보기
  },
  parties: {
    base: '/parties',
  },
  auth: {
    base: '/auth',
    signin: '/auth/sign-in',
  },
  error: '/error',
};
