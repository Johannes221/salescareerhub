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
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Disable problematic features
  swcMinify: false,
  // Use default output - API routes need server-side rendering
  // output: 'export', // This breaks API routes!
};

module.exports = nextConfig;
