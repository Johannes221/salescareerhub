const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load .env from web app root for Render
  env: (() => {
    try {
      const dotenv = require('dotenv');
      const rootEnv = dotenv.config({ path: path.resolve(__dirname, '.env') });
      return rootEnv.parsed || {};
    } catch { return {}; }
  })(),

  // Disable standalone output for now due to memory constraints
  // output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    // Limit image sizes to reduce memory usage
    deviceSizes: [640, 750, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },

  // SWC minifier is faster and uses less memory than Terser
  swcMinify: true,

  // Reduce memory: disable source maps in production
  productionBrowserSourceMaps: false,

  // Experimental: reduce memory usage
  experimental: {
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
  },
};

module.exports = nextConfig;
