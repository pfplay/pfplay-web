import { APP_NAME, generateMetaData } from './generateMetaData';

describe('utils/generateTitles', () => {
  test('단일 루트 타이틀 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: APP_NAME, description: '홈입니다' },
      },
    } as const;

    const result = generateMetaData(routes);
    expect(result).toEqual({
      HOME: { index: { title: APP_NAME, description: '홈입니다' } },
    });
  });

  test('title 이 {APP_NAME} 과 일치하지 않으면 " - {APP_NAME}" suffix 가 붙어야 함', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: APP_NAME, description: '홈입니다' },
      },
      PROFILE: {
        index: { route: 'profile', title: '프로필', description: '프로필입니다' },
      },
    } as const;

    const result = generateMetaData(routes);
    expect(result).toEqual({
      HOME: { index: { title: APP_NAME, description: '홈입니다' } },
      PROFILE: {
        index: { title: `프로필 - ${APP_NAME}`, description: '프로필입니다' },
      },
    });
  });

  test('중첩된 루트 타이틀 생성', () => {
    const routes = {
      USER: {
        index: { route: 'user', title: '사용자', description: '사용자입니다' },
        PROFILE: {
          index: { route: 'profile', title: '프로필', description: '프로필입니다' },
        },
      },
    } as const;

    const result = generateMetaData(routes);

    expect(result).toEqual({
      USER: {
        index: { title: `사용자 - ${APP_NAME}`, description: '사용자입니다' },
        PROFILE: { index: { title: `프로필 - ${APP_NAME}`, description: '프로필입니다' } },
      },
    });
  });

  test('다중 루트 타이틀 생성', () => {
    const routes = {
      HOME: {
        index: { route: 'home', title: APP_NAME, description: '홈입니다' },
      },
      ABOUT: {
        index: { route: 'about', title: '소개', description: '소개입니다' },
      },
    } as const;

    const result = generateMetaData(routes);
    expect(result).toEqual({
      HOME: { index: { title: APP_NAME, description: '홈입니다' } },
      ABOUT: { index: { title: `소개 - ${APP_NAME}`, description: '소개입니다' } },
    });
  });
});
