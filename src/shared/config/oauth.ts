import { AuthConfig } from '../api/http/types/oauth';

export const authConfig: AuthConfig = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
    redirectUri:
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google',
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  twitter: {
    clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || 'your-twitter-client-id',
    redirectUri:
      process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI || 'http://localhost:3000/auth/callback/twitter',
    scope: 'tweet.read users.read',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
  },
  backend: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pfplay-api.app/api',
    authStartPath: '/auth/start',
    tokenExchangePath: '/auth/token',
  },
};
