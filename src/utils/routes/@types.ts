export interface RouteInfo {
  readonly route: string;
  readonly title?: string;
}

interface BaseParentRoute {
  readonly [key: string]: RouteInfo | Omit<ParentRoute, 'group'>;
}

export type ParentRoute =
  | ({ readonly index: RouteInfo } & BaseParentRoute)
  | ({ readonly group: true } & BaseParentRoute);

export type Routes = Record<string, ParentRoute>;

export type ItemRouteOrLabel<T> = T extends RouteInfo
  ? string
  : T extends true /* FIXME: 임시 */
  ? never
  : { [K in keyof T]: ItemRouteOrLabel<T[K]> };
