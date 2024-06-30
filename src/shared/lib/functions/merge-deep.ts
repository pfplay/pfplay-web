/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PartialDeep } from 'type-fest';
import { cloneDeep } from './clone-deep';
import { isPlainObject } from './is-plain-object';

export function mergeDeep<T extends Record<string, any>>(
  initial: T,
  ...overrides: PartialDeep<T>[]
): T {
  return [initial, ...overrides].reduce((acc, curr) => mergeRecursive(acc, curr), {}) as T;
}

function mergeRecursive(source: any, override: any) {
  if (Array.isArray(source) && Array.isArray(override)) {
    return cloneDeep(override);
  }

  if (isPlainObject(source) && isPlainObject(override)) {
    const keys = unique([...Object.keys(source), ...Object.keys(override)]);

    return keys.reduce((acc, key) => {
      let result: unknown;

      if (key in source) {
        if (key in override) {
          result = mergeRecursive(source[key], override[key]);
        } else {
          result = cloneDeep(source[key]);
        }
      } else {
        result = cloneDeep(override[key]);
      }

      return {
        ...acc,
        [key]: result,
      };
    }, {});
  }

  return override;
}

function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
