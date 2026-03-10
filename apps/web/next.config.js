const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load .env from monorepo root
  env: (() => {
    try {
      const dotenv = require('dotenv');
      const rootEnv = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
      return rootEnv.parsed || {};
    } catch { return {}; }
  })(),
  transpilePackages: [
    '@salescareerhub/config',
    '@salescareerhub/types',
    '@salescareerhub/db',
    '@salescareerhub/auth',
    '@salescareerhub/utils',
  ],
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

module.exports = nextConfig;
