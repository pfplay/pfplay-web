/* eslint-disable prettier/prettier */
export type PathMap = {
  '/sign-in': { path: undefined };
  '/': { path: undefined };
  '/parties': { path: undefined };
  '/parties/[id]': { path: { id: string | number } };
  '/settings/avatar': { path: undefined };
  '/settings/profile': { path: undefined };
};
