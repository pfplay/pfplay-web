import { UrlObject } from 'url';
import Link from 'next/link';
import { ComponentProps } from 'react';
import { PathMap } from 'pathmap';
import { parseHref } from './utils';

export type Href = keyof PathMap;
export type PathParams<P extends Href> = PathMap[P] extends {
  path: undefined;
}
  ? object
  : { path: PathMap[P]['path'] };

type AppLinkProps<P extends Href> = PathParams<P> & {
  href: P;
  options?: Omit<UrlObject, 'href' | 'pathname'>;
} & Omit<ComponentProps<typeof Link>, 'href'>;

export const AppLink = <P extends Href>({ children, href, options, ...props }: AppLinkProps<P>) => {
  const pathname = parseHref(href, 'path' in props ? props : {});

  return (
    <Link href={{ pathname, ...options }} {...props}>
      {children}
    </Link>
  );
};
