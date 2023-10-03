import type { Metadata } from 'next';

export interface RouteMetaData extends Pick<Metadata, 'title' | 'description'> {}
export interface RouteInfo extends RouteMetaData {
  readonly route: string;
}

interface BaseParentRoute {
  readonly [key: string]: RouteInfo | Omit<ParentRoute, 'group'>;
}
export type ParentRoute =
  | ({ readonly index: RouteInfo } & BaseParentRoute)
  | ({ readonly group: true | string } & BaseParentRoute);

export type Routes = Record<string, ParentRoute>;

export type ItemRoute<T> = T extends RouteInfo
  ? string
  : { [K in Exclude<keyof T, 'group'>]: ItemRoute<T[K]> };

export type ItemMetaData<T> = T extends RouteInfo
  ? RouteMetaData
  : { [K in Exclude<keyof T, 'group'>]: ItemMetaData<T[K]> };
