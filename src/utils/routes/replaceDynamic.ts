export const replaceDynamic = (path: string, params: Record<string, string | number>): string => {
  return Object.entries(params).reduce(
    (acc, [paramKey, value]) => acc.replace(`[${paramKey}]`, `${value}`),
    path
  );
};
