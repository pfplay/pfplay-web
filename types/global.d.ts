declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // public
      NEXT_PUBLIC_API_HOST_NAME: string;
      NEXT_PUBLIC_API_WS_HOST_NAME: string;
      NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: string;
      NEXT_PUBLIC_WAGMI_PROJECT_ID: string;
      NEXT_PUBLIC_USE_MOCK?: 'true' | 'false';

      // secret
      GOOGLE_ID: string;
      GOOGLE_SECRET: string;
    }
  }

  interface Window {
    debugLevel: number;
  }
}
export {};
