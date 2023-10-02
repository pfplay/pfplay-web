import { omit } from '@/utils/omit';
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
    const result = {} as Record<string, any>;

    for (const [k, v] of Object.entries(routes)) {
      if (k !== 'index' && typeof v === 'object' && !v.route) {
        if ('index' in v) {
          result[k] = mapRoutes(v, joinPath(parentPath, v.index.route));
          continue;
        }
        if ('group' in v && !!v.group) {
          Object.entries(omit(v, 'group')).forEach(([k, v]) => {
            result[k] = mapRoutes(v, joinPath(parentPath, v.index.route));
          });
          continue;
        }
        throw new Error('Invalid structure');
      }

      result[k] = k === 'index' ? parentPath : joinPath(parentPath, v.route);
    }

    return result as ItemRouteOrLabel<T>;
  }

  return mapRoutes(routes, '/');
};
