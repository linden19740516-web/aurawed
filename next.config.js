/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 压缩和性能优化
  compress: true,
  // 环境变量将在构建时注入
  env: {
    NEXT_PUBLIC_APP_NAME: 'AuraWed AI',
  },
  // 生产环境优化
  swcMinify: true,
  poweredByHeader: false,
  // 禁用不需要的功能以减少bundle
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
  },
}

module.exports = nextConfig
