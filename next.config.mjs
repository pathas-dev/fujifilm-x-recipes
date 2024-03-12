import createNextIntlPlugin from 'next-intl/plugin';
import nextPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin();

const withPWA = nextPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: '*',
      },
    ],
  },
};

export default withNextIntl(withPWA(nextConfig));
