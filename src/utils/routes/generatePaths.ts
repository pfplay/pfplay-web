import { omit } from '@/utils/omit';
import type { ItemRoute, ParentRoute, RouteInfo, Routes } from './@types';

export const generatePaths = <T extends Routes>(routes: T): ItemRoute<T> => {
  function expectParentPath(parentPath: string): string {
    return parentPath === '/' ? '' : parentPath;
  }
  function joinPath(parentPath: string, path: string): string {
    return expectParentPath(parentPath) + '/' + path;
  }

  function mapRoutes(routes: Routes | ParentRoute | RouteInfo, parentPath: string): ItemRoute<T> {
    return Object.fromEntries(
      Object.entries(routes).map(([k, v]) => {
        if (k !== 'index' && typeof v === 'object' && !v.route) {
          if ('index' in v) {
            return [k, mapRoutes(v, joinPath(parentPath, v.index.route))];
          }
          if ('group' in v) {
            if (v.group === true) {
              return [k, mapRoutes(omit(v, 'group'), parentPath)];
            }
            if (typeof v.group === 'string') {
              return [k, mapRoutes(omit(v, 'group'), joinPath(parentPath, v.group))];
            }
          }
          throw new Error('Invalid structure');
        }

        const routeName = k === 'index' ? parentPath : joinPath(parentPath, v.route);
        return [k, routeName];
      })
    );
  }

  return mapRoutes(routes, '/');
};
