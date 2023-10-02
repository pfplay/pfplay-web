import { generatePaths } from './generatePaths';

describe('generatePaths 함수 테스트', () => {
  test('기본 루트 경로 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home' },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      HOME: { index: '/home' },
    });
  });

  test('다이나믹 라우트 경로 생성', () => {
    const routes = {
      PROFILE: {
        index: { route: 'profile/[id]' },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      PROFILE: { index: '/profile/[id]' },
    });
  });

  test('중첩된 루트 경로 생성', () => {
    const routes = {
      USER: {
        index: { route: 'user' },
        PROFILE: {
          index: { route: 'profile' },
          settings: { route: 'settings' },
        },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      USER: {
        index: '/user',
        PROFILE: {
          index: '/user/profile',
          settings: '/user/profile/settings',
        },
      },
    });
  });

  test('다중 루트 경로 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home' },
      },
      ABOUT: {
        index: { route: 'about' },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      HOME: { index: '/home' },
      ABOUT: { index: '/about' },
    });
  });

  test('NextJS group route 대응', () => {
    const routes = {
      USER: {
        index: { route: 'user' },
        PROFILE: {
          index: { route: 'profile' },
          settings: { route: 'settings' },
        },
      },
      GROUP: {
        group: true,
        PROFILE: {
          index: { route: 'profile' },
          settings: { route: 'settings' },
        },
        AVATAR: {
          index: { route: 'avatar' },
          settings: { route: 'settings' },
        },
      },
    } as const;

    const result = generatePaths(routes);

    expect(result).toEqual({
      USER: {
        index: '/user',
        PROFILE: {
          index: '/user/profile',
          settings: '/user/profile/settings',
        },
      },
      GROUP: {
        PROFILE: {
          index: '/profile',
          settings: '/profile/settings',
        },
        AVATAR: {
          index: '/avatar',
          settings: '/avatar/settings',
        },
      },
    });
  });
});
