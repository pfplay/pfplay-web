import qs from 'querystring';
import { getSession } from 'next-auth/react';
import { paths } from '@/types/api-docs';
import { getServerAuthSession } from './authOptions';
import { APIError } from './exception';

export type Path = keyof paths;
export type Method<P extends Path> = keyof paths[P];
type RequestParams<P extends Path, M extends Method<P>> = paths[P][M] extends {
  parameters: unknown;
}
  ? paths[P][M]['parameters']
  : undefined;

type RequestBody<P extends Path, M extends Method<P>> = paths[P][M] extends {
  requestBody: { content: { 'application/json': unknown } };
}
  ? paths[P][M]['requestBody']['content']['application/json']
  : undefined;

type Response<P extends Path, M extends Method<P>> = paths[P][M] extends {
  responses: { 200: { content: { '*/*': unknown } } };
}
  ? paths[P][M]['responses'][200]['content']['*/*']
  : paths[P][M] extends { responses: { 200: { content: { 'application/json': unknown } } } }
  ? paths[P][M]['responses'][200]['content']['application/json']
  : paths[P][M] extends {
      responses: { default: { content: { '*/*': unknown } } };
    }
  ? paths[P][M]['responses']['default']['content']['*/*']
  : paths[P][M] extends { responses: { default: { content: { 'application/json': unknown } } } }
  ? paths[P][M]['responses']['default']['content']['application/json']
  : undefined;

type BodyParameters<P extends Path, M extends Method<P>> = RequestBody<P, M> extends undefined
  ? object
  : { body: RequestBody<P, M> };
type RequestParameters<P extends Path, M extends Method<P>> = RequestParams<P, M> extends undefined
  ? object
  : { params: RequestParams<P, M> };

type FetcherParameters<P extends Path, M extends Method<P>> = {
  url: P;
  method: M;
};

type UnknownObject = { [key: string]: number | string };

export const fetcher = async <P extends Path, M extends Method<P>>({
  method,
  url,
  config,
  ...rest
}: FetcherParameters<P, M> & {
  config?: Omit<RequestInit, 'body' | 'method'>;
} & BodyParameters<P, M> &
  RequestParameters<P, M>) => {
  let _url = url as string;

  if ('params' in rest && 'path' in (rest['params'] as UnknownObject)) {
    const { path } = rest.params as {
      path: UnknownObject;
    };

    _url = url.replace(/\{(\w+)\}/g, (match, key) => String(path[key] || match));
  }

  if ('params' in rest && 'query' in (rest['params'] as UnknownObject)) {
    const { query } = rest.params as {
      query: UnknownObject;
    };
    _url = `${_url}?${qs.stringify(query)}`;
  }

  const body = 'body' in rest ? JSON.stringify(rest.body) : null;

  const session = (await getSession()) ?? (await getServerAuthSession());

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST_NAME_V2}${_url}`, {
    method: method as string,
    headers: {
      ...(body && { 'Content-type': 'application/json' }),
      ...(session && { Authorization: `Bearer ${session.user.accessToken}` }),
      ...config?.headers,
    },
    body,
    ...config,
  });

  if (!res.ok) {
    const { data } = (await res.json()) as {
      data: { status: string; code: number; message: string };
    };

    throw new APIError({ ...data });
  }

  return (await res.json()) as Promise<Response<P, M>>;
};
