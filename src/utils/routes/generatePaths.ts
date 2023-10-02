import type { ItemRouteOrLabel, ParentRoute, RouteInfo, Routes } from './@types';

export const generatePaths = <T extends Routes>(routes: T): ItemRouteOrLabel<T> => {
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
