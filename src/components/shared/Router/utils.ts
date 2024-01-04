import qs from 'querystring';

export const pathify = (str: string, variables: Record<string, number | string>) =>
  str.replace(/\[(\w+)\]/g, (match, key) => String(variables[key] || match));

export const parseHref = <
  P extends {
    path?: Record<string, string | number>;
    query?: Record<string, string | number>;
  }
>(
  href: string,
  params?: P
) => {
  if (params && 'path' in params && params.path) {
    href = pathify(href, params.path);
  }

  if (params && 'query' in params && params.query) {
    href = href + '?' + qs.stringify(params.query);
  }

  return href;
};
