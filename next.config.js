/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent browser bundle from trying to import Node.js-only native modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    // Externalise native modules that can't run in webpack
    config.externals = [
      ...(config.externals || []),
      'sodium-native',
    ]
    return config
  },
}

module.exports = nextConfig
