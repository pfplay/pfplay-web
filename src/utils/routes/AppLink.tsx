import { UrlObject } from 'url';
import Link from 'next/link';
import React from 'react';
import { PathMap } from '@/types/pathmap';
import { Href } from './types';
import { pathify } from './utils';

export type PathParams<P extends Href> = PathMap[P] extends {
  path: undefined;
}
  ? object
  : { path: PathMap[P]['path'] };

export type AppLinkProps<P extends Href> = PathParams<P> & {
  href: P;
  options?: Omit<UrlObject, 'href' | 'pathname'>;
} & Omit<React.ComponentProps<typeof Link>, 'href'>;

export const AppLink = <P extends Href>({ children, href, options, ...props }: AppLinkProps<P>) => {
  let pathname = `${href}`;
  if ('path' in props && typeof props['path'] !== undefined) {
    pathname = pathify(href, props.path as Record<string, string | number>);
  }

  return (
    <Link href={{ pathname, ...options }} {...props}>
      {children}
    </Link>
  );
};
