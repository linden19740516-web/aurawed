/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // 环境变量将在构建时注入
  env: {
    NEXT_PUBLIC_APP_NAME: 'AuraWed AI',
  },
}

module.exports = nextConfig
