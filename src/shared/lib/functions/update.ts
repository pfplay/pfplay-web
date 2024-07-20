import { PartialDeep } from 'type-fest';
import { isPureObject } from './is-pure-object';
import { mergeDeep } from './merge-deep';

/**
 * next가 object라면 mergeDeep을 실행하고, function이라면 return 값 그대로 반환합니다.
 * 즉 replace를 원한다면 function 타입 next를 사용하세요.
 */
export function update<T>(prev: T, next: Next<T>): T {
  if (isFunction(next)) return next(prev);

  if (!isPureObject(prev) || !isPureObject(next)) return next as T;

  // @ts-expect-error
  return mergeDeep(prev, next) as T;
}

type NextFn<T> = (prev: T) => T;
export type Next<T> = PartialDeep<T> | NextFn<T>;

function isFunction<T>(next: Next<T>): next is NextFn<T> {
  return typeof next === 'function';
}
