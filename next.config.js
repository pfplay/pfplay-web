/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    webpackBuildWorker: true,
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
  output: 'standalone',
};

module.exports = nextConfig;
