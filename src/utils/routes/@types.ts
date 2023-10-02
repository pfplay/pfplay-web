export interface RouteInfo {
  readonly route: string;
  readonly title?: string;
}

export interface ParentRoute {
  readonly index: RouteInfo;
  readonly [key: string]: RouteInfo | ParentRoute;
}

export type Routes = Record<string, ParentRoute>;

export type ItemRouteOrLabel<T> = T extends RouteInfo
  ? string
  : { [K in keyof T]: ItemRouteOrLabel<T[K]> };
