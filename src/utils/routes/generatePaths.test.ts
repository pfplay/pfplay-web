import { APP_NAME } from '@/utils/routes/generateMetaData';
import { generatePaths } from './generatePaths';

describe('generatePaths 함수 테스트', () => {
  test('기본 루트 경로 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: APP_NAME, description: 'description' },
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
        index: { route: 'profile/[id]', title: APP_NAME, description: 'description' },
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
        index: { route: 'user', title: APP_NAME, description: 'description' },
        PROFILE: {
          index: { route: 'profile', title: APP_NAME, description: 'description' },
          settings: { route: 'settings', title: APP_NAME, description: 'description' },
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
        index: { route: 'home', title: APP_NAME, description: 'description' },
      },
      ABOUT: {
        index: { route: 'about', title: APP_NAME, description: 'description' },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      HOME: { index: '/home' },
      ABOUT: { index: '/about' },
    });
  });

  test('NextJS group route 와 page.tsx 없는 디렉터리 대응', () => {
    const routes = {
      USER: {
        index: { route: 'user', title: APP_NAME, description: 'description' },
        PROFILE: {
          index: { route: 'profile', title: APP_NAME, description: 'description' },
          settings: { route: 'settings', title: APP_NAME, description: 'description' },
        },
      },
      GROUP: {
        group: true,
        PROFILE: {
          index: { route: 'profile', title: APP_NAME, description: 'description' },
          settings: { route: 'settings', title: APP_NAME, description: 'description' },
        },
      },
      GROUP_WITH_PATH: {
        group: 'my-group',
        PROFILE: {
          index: { route: 'profile', title: APP_NAME, description: 'description' },
          settings: { route: 'settings', title: APP_NAME, description: 'description' },
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
      },
      GROUP_WITH_PATH: {
        PROFILE: {
          index: '/my-group/profile',
          settings: '/my-group/profile/settings',
        },
      },
    });
  });
});