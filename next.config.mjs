import createNextIntlPlugin from 'next-intl/plugin';
import nextPWA from 'next-pwa';
import nextMDX from '@next/mdx';

const withNextIntl = createNextIntlPlugin();
const withMDX = nextMDX();

const withPWA = nextPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disableDevLogs: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMDX(withNextIntl(withPWA(nextConfig)));
