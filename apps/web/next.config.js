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
  // Memory optimization - remove experimental features that cause memory issues
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable problematic features for low-memory environments
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Reduce memory usage during build
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      // Reduce parallel processing to save memory
      parallelism: 1,
    };
    
    return config;
  },
};

module.exports = nextConfig;
