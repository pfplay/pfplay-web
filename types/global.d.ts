declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // public
      NEXT_PUBLIC_API_HOST_NAME: string;
      NEXT_PUBLIC_API_WS_HOST_NAME: string;
      NEXT_PUBLIC_ALCHEMY_PUBLIC_API_KEY: string;
      NEXT_PUBLIC_WAGMI_PROJECT_ID: string;
      NEXT_PUBLIC_USE_MOCK?: 'true' | 'false';
      // next.config.js 에서 빌드 타임 VERCEL_ENV 를 인라인. 진단 로그 게이트가 'production' 여부로 분기한다.
      NEXT_PUBLIC_VERCEL_ENV?: 'production' | 'preview' | 'development' | '';

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
