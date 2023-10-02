import { generateTitles } from './generateTitles';

describe('generateTitles 함수 테스트', () => {
  test('단일 루트 타이틀 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: '홈' },
      },
    } as const;

    const result = generateTitles(routes);
    expect(result).toEqual({
      HOME: { index: '홈' },
    });
  });

  test('중첩된 루트 타이틀 생성', () => {
    const routes = {
      USER: {
        index: { route: 'user', title: '사용자' },
        PROFILE: {
          index: { route: 'profile', title: '프로필' },
        },
      },
    } as const;

    const result = generateTitles(routes);
    expect(result).toEqual({
      USER: {
        index: '사용자',
        PROFILE: { index: '프로필' },
      },
    });
  });

  test('다중 루트 타이틀 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: '홈' },
      },
      ABOUT: {
        index: { route: 'about', title: '소개' },
      },
    } as const;

    const result = generateTitles(routes);
    expect(result).toEqual({
      HOME: { index: '홈' },
      ABOUT: { index: '소개' },
    });
  });
});
