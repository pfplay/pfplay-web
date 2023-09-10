interface RouteInfo {
  readonly route: string;
  readonly title?: string;
}
interface ParentRoute {
  readonly index: RouteInfo;
  readonly [key: string]: RouteInfo | ParentRoute;
}
type Routes = Record<string, ParentRoute>;
type ItemRouteOrLabel<T> = T extends RouteInfo
  ? string
  : { [K in keyof T]: ItemRouteOrLabel<T[K]> };

const noAuthRoutes = {
  HOME: {
    index: { route: '/', title: 'Home' },
  },
  AUTH: {
    index: { route: 'auth', title: 'Auth' },
    signIn: { route: 'sign-in', title: 'Sign In' },
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
    index: { route: 'parties/[id]', title: 'Parties' },
  },
} as const;

const generatePaths = <T extends Routes>(routes: T): ItemRouteOrLabel<T> => {
  function expectParentPath(parentPath: string): string {
    return parentPath === '/' ? '' : parentPath;
  }
  function joinPath(parentPath: string, path: string): string {
    return expectParentPath(parentPath) + '/' + path;
  }

  function mapRoutes(
    routes: Routes | ParentRoute | RouteInfo,
    parentPath: string
  ): ItemRouteOrLabel<T> {
    return Object.fromEntries(
      Object.entries(routes).map(([k, v]) => {
        if (k !== 'index' && typeof v === 'object' && !v.route) {
          return [k, mapRoutes(v, joinPath(parentPath, v.index.route))];
        }

        const routeName = k === 'index' ? parentPath : joinPath(parentPath, v.route);
        return [k, routeName];
      })
    );
  }

  return mapRoutes(routes, '/');
};

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
 * router.push(routerHelper.replaceDynamic(
 *   ROUTES.PARENT.detail.route,
 *   { userId: 1000 }
 * ))
 * ** --------------------------- **
 * ```
 */
export const ROUTES = generatePaths(authRoutes);
export const NO_AUTH_ROUTES = generatePaths(noAuthRoutes);
