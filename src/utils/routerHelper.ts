export const routerHelper = {
  generatePath(path: string | string[], parentPath: string): string {
    const paths = Array.isArray(path) ? path : [path];
    return paths.map((path) => (parentPath + path).replace(/\/\//g, '/'))[0];
  },
  replaceDynamic(path: string, params: Record<string, string | number>): string {
    return Object.entries(params).reduce(
      (acc, [paramKey, value]) => acc.replace(`[${paramKey}]`, `${value}`),
      path
    );
  },
};
