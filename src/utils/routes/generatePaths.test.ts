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
        },
      },
    } as const;

    const result = generatePaths(routes);
    expect(result).toEqual({
      USER: {
        index: '/user',
        PROFILE: { index: '/user/profile' },
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
});
