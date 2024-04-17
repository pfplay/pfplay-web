'use client';

import {
  NavigateOptions,
  PrefetchOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { PathMap } from 'pathmap';
import { parseHref } from './utils';

type Href = keyof PathMap;

type NavigationOptionsWithQuery = NavigateOptions & {
  query?: Record<string, string>;
};

type PrefetchOptionsWithQuery = PrefetchOptions & {
  query?: Record<string, string>;
};

type PushArgs<P extends Href> = PathMap[P] extends {
  path: undefined;
}
  ? [options?: NavigationOptionsWithQuery]
  : [options: NavigationOptionsWithQuery & { path: PathMap[P]['path'] }];

type PrefetchArgs<P extends Href> = PathMap[P] extends {
  path: undefined;
}
  ? [options?: PrefetchOptionsWithQuery]
  : [
      options: Partial<PrefetchOptionsWithQuery> & {
        path: PathMap[P]['path'];
      }
    ];

export const useAppRouter = () => {
  const { push: _push, replace: _replace, prefetch: _prefetch, ...rest } = useRouter();

  const push = <P extends Href>(href: P, ...args: PushArgs<P>) => {
    const arg = args[0];
    _push(parseHref(href, arg), arg);
  };

  const replace = <P extends Href>(href: P, ...args: PushArgs<P>) => {
    const arg = args[0];
    _replace(parseHref(href, arg), arg);
  };

  const prefetch = <P extends Href>(href: P, ...args: PrefetchArgs<P>) => {
    const arg = args[0];

    if (arg?.kind) {
      _prefetch(parseHref(href, arg), arg as PrefetchOptionsWithQuery);
      return;
    }

    _prefetch(parseHref(href, arg));
  };

  return {
    push,
    replace,
    prefetch,
    ...rest,
  };
};
