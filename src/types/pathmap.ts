/* eslint-disable prettier/prettier */
export type PathMap = {
  '/sign-in': { path: undefined };
  '/': { path: undefined };
  '/parties': { path: undefined };
  '/parties/[id]': { path: { id: string | number } };
  '/settings/avatar': { path: undefined };
  '/settings/profile': { path: undefined };
  '/docs/privacy-policy': { path: undefined };
  '/docs/terms-of-service': { path: undefined };
};
