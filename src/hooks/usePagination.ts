import { useQueryState } from 'next-usequerystate';
import { useEffect, useRef, useState } from 'react';
import qs from 'qs';
import { PageRequest, PageResponse } from '@/api/@types/@shared';
import { useDialog } from '@/hooks/useDialog';
import { isPureObject } from '@/utils/isPureObject';
import { decoder } from '@/utils/qs';

export const DEFAULT_PAGE_REQUEST: PageRequest = {
  page: 0,
  size: 10,
};

export function usePagination<Req extends PageRequest, Data>(
  fetchFunc: (request: Req) => Promise<PageResponse<Data>>,
  // @ts-expect-error - ignore subtype error
  initialRequest: Req = DEFAULT_PAGE_REQUEST
) {
  const { openErrorDialog } = useDialog();
  const [queryState, setQueryState] = useQueryState<Req>('q', {
    defaultValue: initialRequest,
    parse: (value) => qs.parse(value, { decoder }) as unknown as Req,
    serialize: (value) => qs.stringify(value),
  });
  const request = { ...initialRequest, ...queryState };
  const prevRequestRef = useRef<Req>(request);
  const [initialFetched, setInitialFetched] = useState(false);
  const initialized = useRef(false);
  const [response, setResponse] = useState<PageResponse<Data>>();
  const [loading, setLoading] = useState(false);

  const pageable = {
    totalPages: response?.pagination?.totalPages ?? 0,
    totalElements: response?.pagination?.totalElements ?? 0,
    isFirstPage: request.page === 0,
    isLastPage: request.page === (response?.pagination.totalPages ?? 1) - 1 ?? true,
    currentPage: request.page,
    empty: response?.pagination ? response.pagination.totalElements === 0 : true,
  } as const;

  const fetchData = async (req: Req) => {
    if (loading) return;
    if (initialFetched && JSON.stringify(prevRequestRef.current) === JSON.stringify(req)) return;

    try {
      setLoading(true);
      const res = await fetchFunc(req);
      setResponse((prev) => ({
        ...res,
        content: [...(prev?.content ?? []), ...res.content],
      }));
    } catch (e) {
      openErrorDialog(e);
    } finally {
      setLoading(false);
      setInitialFetched(true);
      prevRequestRef.current = req;
    }
  };

  const setRequest = async (next: Req | ((prev: Req) => Req)) => {
    const _request = typeof next === 'function' ? next(request) : request;
    const hasChangedExceptPage = hasDifference(_request, prevRequestRef.current, new Set(['page']));

    if (hasChangedExceptPage) {
      setResponse(undefined);
    }

    const nextRequest = hasChangedExceptPage ? { ..._request, page: 0 } : _request;
    await setQueryState(nextRequest);
  };

  const resetRequest = async () => {
    await setQueryState(initialRequest);
  };

  const prevPage = async () => {
    if (loading || pageable.isFirstPage) return;
    const nextRequest = { ...request, page: request.page - 1 };
    await setQueryState(nextRequest);
  };

  const nextPage = async () => {
    if (loading || pageable.isLastPage) return;
    const nextRequest = { ...request, page: request.page + 1 };
    await setQueryState(nextRequest);
  };

  useEffect(() => {
    if (!initialized.current) {
      // NOTE: 새로고침 시 page 0 으로 초기화.
      const nextRequest = { ...initialRequest, ...queryState, page: 0 };
      setQueryState(nextRequest);
      initialized.current = true;
      return;
    }
    fetchData({ ...initialRequest, ...queryState });
  }, [queryState]);

  return {
    data: response?.content,
    loading,
    prevPage,
    nextPage,
    request,
    setRequest,
    resetRequest,
    pageable,
  };
}

function hasDifference<T>(obj1: T, obj2: T, exceptionKeys?: Set<string>) {
  if (!isPureObject(obj1) || !isPureObject(obj2)) throw new Error('obj1, obj2 must be pure object');

  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of keys) {
    if (exceptionKeys?.has(key)) continue;
    if (obj1[key] !== obj2[key]) return true;
  }
  return false;
}
