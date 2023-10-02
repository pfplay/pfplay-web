import { generatePaths } from '@/utils/routes/generatePaths';
import { generateTitles } from '@/utils/routes/generateTitles';

const noAuthRoutes = {
  HOME: {
    index: { route: '/', title: 'Home' },
  },
  SIGN_IN: {
    index: { route: 'sign-in', title: 'Auth' },
  },
  PARTIES: {
    index: { route: 'parties', title: 'Parties' },
  },
  ERROR: {
    index: { route: 'error', title: 'Error' }, // TODO: error.ts 페이지 추가
  },
} as const;

const authRoutes = {
  PROFILE: {
    index: { route: 'profile', title: 'Profile' },
    settings: { route: 'settings', title: 'Profile Settings' },
    edit: { route: 'edit', title: 'Profile Edit' }, // TODO: setting과 edit에 관해서 각 use case마다 어떻게 구분할지 고민해보기
  },
  AVATAR: {
    index: { route: 'avatar', title: 'Avatar' },
    settings: { route: 'settings', title: 'Avatar Settings' },
  },
  PARTIES: {
    index: { route: 'parties', title: 'Parties' },
    room: { route: 'room/[id]', title: 'Party Room' },
  },
} as const;

/**
 * ```
 * ** ----- Dynamic Example ----- **
 * const authRoutes = {
 *   ...
 *   PARENT: {
 *     index: { route: 'abc', title: 'ABC' }
 *     detail: { route: 'detail/[userId]', title: 'ABC Detail' },
 *   },
 * }
 * ...
 * router.push(replaceDynamic(
 *   ROUTES.PARENT.detail.route,
 *   { userId: 1000 }
 * ))
 * ** --------------------------- **
 * ```
 */
export const ROUTES = generatePaths(authRoutes);
export const NO_AUTH_ROUTES = generatePaths(noAuthRoutes);
export const PAGE_TITLES = generateTitles({ ...noAuthRoutes, ...authRoutes });
