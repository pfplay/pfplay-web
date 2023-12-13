declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_HOST_NAME?: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      NEXT_PUBLIC_ALCHEMY_ID?: string;
      NEXT_PUBLIC_PROJECT_ID: string;
      OPENSEA_ID?: string;
      OPENSEA_BASE_URL?: string;
      GOOGLE_ID?: string;
      GOOGLE_SECRET?: string;
    }
  }
}
