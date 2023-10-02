import type { ItemRouteOrLabel, ParentRoute, RouteInfo, Routes } from './@types';

export const generateTitles = <T extends Routes>(routes: T): ItemRouteOrLabel<T> => {
  function mapRoutes(routes: Routes | ParentRoute | RouteInfo): ItemRouteOrLabel<T> {
    return Object.fromEntries(
      Object.entries(routes).map(([k, v]) => {
        if (k !== 'index' && typeof v === 'object' && !v.title) {
          return [k, mapRoutes(v)];
        }

        return [k, v.title as string];
      })
    );
  }

  return mapRoutes(routes);
};
