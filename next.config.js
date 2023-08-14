/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { domains: ['lh3.googleusercontent.com', 'picsum.photos', 'postfiles.pstatic.net'] },
  experimental: {
    appDir: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;
