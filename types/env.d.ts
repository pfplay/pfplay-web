declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // public
      NEXT_PUBLIC_API_HOST_NAME?: string;
      NEXTAUTH_URL?: string;

      // secret
      NEXTAUTH_SECRET?: string;
      NEXT_PUBLIC_ALCHEMY_ID?: string;
      NEXT_PUBLIC_PROJECT_ID: string;
      GOOGLE_ID?: string;
      GOOGLE_SECRET?: string;
    }
  }
}
