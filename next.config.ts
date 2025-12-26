import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Only process app files, ignore node_modules to avoid test file issues
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx|mjs)$/,
      loader: 'ignore-loader',
    });
    
    // Fix for node polyfills on client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // Empty turbopack config to silence the webpack/turbopack config conflict
  turbopack: {},
};

export default nextConfig;
