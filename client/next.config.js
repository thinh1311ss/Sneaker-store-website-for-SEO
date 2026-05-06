/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu ảnh
  images: {
    // Thêm AVIF trước WebP → Next.js sẽ serve AVIF cho browser hỗ trợ (nhẹ hơn WebP ~20%)
    formats: ['image/avif', 'image/webp'],
    // Tối ưu breakpoints - giảm số ảnh generated (tiết kiệm build time + CDN cost)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Cache ảnh 60 ngày (mặc định chỉ 60 giây - quá ngắn)
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
      // Thêm các domain ảnh khác nếu bạn dùng (ví dụ Cloudinary, S3...)
    ],
  },

  // Bật compression cho HTML/CSS/JS (gzip/brotli)
  compress: true,

  // Bỏ header X-Powered-By để bảo mật hơn
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // ✅ THÊM MỚI: Redirect /thuong-hieu → /collections (fix 404)
  async redirects() {
    return [
      {
        // Redirect tất cả /thuong-hieu/[brand] → /collections/[brand]
        source: '/thuong-hieu/:brand',
        destination: '/collections/:brand',
        permanent: true, // 301 redirect — giữ nguyên SEO juice
      },
      {
        // Fix broken link /he-thong-cua-hang → trang gioi-thieu
        source: '/he-thong-cua-hang',
        destination: '/gioi-thieu',
        permanent: true,
      },
    ];
  },

  // Custom headers - thêm cache cho static assets
  async headers() {
    return [
      {
        // Headers cho TẤT CẢ trang
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy cho privacy + analytics
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache cực dài cho ảnh Next optimization
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache cực dài cho static files (logo, icons...)
        source: '/:path*(svg|jpg|jpeg|png|webp|avif|ico|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts 1 năm
        source: '/:path*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;