import { isPlainObject } from './is-plain-object';

export function cloneDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(cloneDeep) as unknown as T;
  }

  if (isPlainObject(obj)) {
    const cloned: Record<string, unknown> = {};

    for (const key in obj) {
      cloned[key] = cloneDeep(obj[key]);
    }

    return cloned as T;
  }

  return obj;
}
