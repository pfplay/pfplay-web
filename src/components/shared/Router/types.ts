/* eslint-disable prettier/prettier */
export type PathMap = {
  '/sign-in': { path: undefined };
  '/': { path: undefined };
  '/parties': { path: undefined };
  '/parties/[id]': { path: { id: string | number } };
  '/privacy-and-terms/privacy-policy': { path: undefined };
  '/privacy-and-terms/terms-of-service': { path: undefined };
  '/settings/avatar': { path: undefined };
  '/settings/profile': { path: undefined };
};
