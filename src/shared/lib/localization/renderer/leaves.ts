/**
 * @example
 * type NestedObjectType = {
 *   a: string; b: string;
 *   nest: { c: string; };
 *   otherNest: { c: string; };
 * };
 *
 * type NestedObjectLeaves = Leaves<NestedObjectType>;
 * // 'a' | 'b' | 'nest.c' | 'otherNest.c'
 */
export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;
