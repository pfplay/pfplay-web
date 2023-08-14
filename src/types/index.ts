type NonNull<T> = T extends null ? never : T;
export type RecursiveExcludeNull<T extends Record<string, unknown>> = {
  [K in keyof T]: NonNull<T[K]> extends Record<string, unknown>
    ? RecursiveExcludeNull<NonNull<T[K]>>
    : NonNull<T[K]>;
};
