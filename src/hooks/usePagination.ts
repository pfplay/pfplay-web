import { useQueryState } from 'next-usequerystate';
import { useEffect, useRef, useState } from 'react';
import qs from 'qs';
import { PaginationPayload, PageResponse } from '@/api/@types/@shared';
import { useDialog } from '@/hooks/useDialog';
import { isPureObject } from '@/utils/isPureObject';
import { decoder } from '@/utils/qs';

export const DEFAULT_PAGE_PAYLOAD: PaginationPayload = {
  page: 0,
  size: 10,
};

export function usePagination<Payload extends PaginationPayload, Data>(
  fetchFunc: (payload: Payload) => Promise<PageResponse<Data>>,
  // @ts-expect-error - ignore subtype error
  initialPayload: Payload = DEFAULT_PAGE_PAYLOAD
) {
  const { openErrorDialog } = useDialog();
  const [queryState, setQueryState] = useQueryState<Payload>('q', {
    defaultValue: initialPayload,
    parse: (value) => qs.parse(value, { decoder }) as unknown as Payload,
    serialize: (value) => qs.stringify(value),
  });
  const payload = { ...initialPayload, ...queryState };
  const prevPayloadRef = useRef<Payload>(payload);
  const [initialFetched, setInitialFetched] = useState(false);
  const initialized = useRef(false);
  const [response, setResponse] = useState<PageResponse<Data>>();
  const [loading, setLoading] = useState(false);

  const pageable = {
    totalPages: response?.pagination?.totalPages ?? 0,
    totalElements: response?.pagination?.totalElements ?? 0,
    isFirstPage: payload.page === 0,
    isLastPage: payload.page === (response?.pagination.totalPages ?? 1) - 1 ?? true,
    currentPage: payload.page,
    empty: response?.pagination ? response.pagination.totalElements === 0 : true,
  } as const;

  const fetchData = async (req: Payload) => {
    if (loading) return;
    if (initialFetched && JSON.stringify(prevPayloadRef.current) === JSON.stringify(req)) return;

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
      prevPayloadRef.current = req;
    }
  };

  const setPayload = async (next: Payload | ((prev: Payload) => Payload)) => {
    const _payload = typeof next === 'function' ? next(payload) : payload;
    const hasChangedExceptPage = hasDifference(_payload, prevPayloadRef.current, new Set(['page']));

    if (hasChangedExceptPage) {
      setResponse(undefined);
    }

    const nextPayload = hasChangedExceptPage ? { ..._payload, page: 0 } : _payload;
    await setQueryState(nextPayload);
  };

  const resetPayload = async () => {
    await setQueryState(initialPayload);
  };

  const prevPage = async () => {
    if (loading || pageable.isFirstPage) return;
    const nextPayload = { ...payload, page: payload.page - 1 };
    await setQueryState(nextPayload);
  };

  const nextPage = async () => {
    if (loading || pageable.isLastPage) return;
    const nextPayload = { ...payload, page: payload.page + 1 };
    await setQueryState(nextPayload);
  };

  useEffect(() => {
    const nextPayload = { ...initialPayload, ...queryState };

    if (!initialized.current) {
      // NOTE: 새로고침 시 page 0 으로 초기화.
      setQueryState({ ...nextPayload, page: 0 });
      initialized.current = true;
      return;
    }

    fetchData(nextPayload);
  }, [queryState]);

  return {
    data: response?.content,
    loading,
    prevPage,
    nextPage,
    payload,
    setPayload,
    resetPayload,
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
