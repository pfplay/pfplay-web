import { omit } from '@/utils/omit';
import type { ItemMetaData, ParentRoute, RouteInfo, RouteMetaData, Routes } from './@types';

export const APP_NAME = 'PFPlay';

export const generateMetaData = <T extends Routes>(routes: T): ItemMetaData<T> => {
  function mapRoutes(routes: Routes | ParentRoute | RouteInfo): ItemMetaData<T> {
    return Object.fromEntries(
      Object.entries(routes).map(([k, v]) => {
        if (k !== 'index' && typeof v === 'object' && !v.title) {
          return [k, mapRoutes(v)];
        }

        const metaData: RouteMetaData = omit(v, 'route');

        if (metaData.title !== APP_NAME) {
          metaData.title = `${metaData.title} - ${APP_NAME}`;
        }

        return [k, metaData];
      })
    ) as ItemMetaData<T>;
  }

  return mapRoutes(routes);
};
