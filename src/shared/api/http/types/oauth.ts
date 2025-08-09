export type OAuth2Provider = 'google' | 'twitter';

export interface AuthConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string;
    authUrl: string;
  };
  twitter: {
    clientId: string;
    redirectUri: string;
    scope: string;
    authUrl: string;
  };
  backend: {
    baseUrl: string;
    authStartPath: string;
    tokenExchangePath: string;
  };
}
