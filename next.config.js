/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 빌드 타임 시스템 변수 VERCEL_ENV 를 클라이언트 번들에 NEXT_PUBLIC_ 으로 직접 인라인한다.
  // Vercel 의 NEXT_PUBLIC_ 자동 prefix 노출 동작에 의존하지 않기 위함 —
  // 프로젝트 설정 "Enable access to System Environment Variables" 토글만 ON 이면
  // (= VERCEL_ENV 가 빌드에 제공되면) 진단 로그 게이트가 결정적으로 동작한다.
  // 로컬엔 VERCEL_ENV 부재 → '' → 비프로덕션(진단 로그 노출). 참고: shouldEmitDiagnosticLog.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? '',
  },
  experimental: {
    webpackBuildWorker: true,
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // api 측 아바타 body 이미지 저장소
        pathname: '/v0/b/pfplay-firebase.appspot.com/**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com', // 유튜브 검색 결과에 있는 썸네일 이미지
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mint.fun',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.opensea.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'opensea.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'download.ghostsproject.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'cybergalzpte.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mnn.mypinata.cloud',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'postfiles.pstatic.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'i.seadn.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'media.contextcdn.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.hunt.town',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'm.thecoffeeclubnft.com',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
