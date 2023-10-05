declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_HOST_NAME?: string;
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      ALCHEMY_ID?: string;
      GOOGLE_ID?: string;
      GOOGLE_SECRET?: string;
    }
  }
}
