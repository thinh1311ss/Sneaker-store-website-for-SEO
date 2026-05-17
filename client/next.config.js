/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu ảnh
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  async redirects() {
    return [
      // Redirect /thuong-hieu/[brand] → /collections/[brand]
      {
        source: '/thuong-hieu/:brand',
        destination: '/collections/:brand',
        permanent: true,
      },
      // Fix broken link /he-thong-cua-hang → /gioi-thieu
      {
        source: '/he-thong-cua-hang',
        destination: '/gioi-thieu',
        permanent: true,
      },
      // ✅ Fix bài blog bị xóa → redirect về /blog
      {
        source: '/blog/adidas-adizero-adios-pro-evo-3-moi-dieu-ban-can-biet',
        destination: '/blog',
        permanent: true,
      },
      // ✅ Fix /blog/blog?tag=... → /blog?tag=...
      {
        source: '/blog/blog',
        destination: '/blog',
        permanent: true,
      },
      // ✅ Fix /forgot-password 404
      {
        source: '/forgot-password',
        destination: '/login',
        permanent: false,
      },
      // ✅ Fix nhóm 4 — redirect đến đúng section
      {
        source: '/ho-tro/chinh-sach-doi-tra',
        destination: '/ho-tro#doi-tra-bao-hanh',
        permanent: true,
      },
      {
        source: '/ho-tro/huong-dan-mua-hang',
        destination: '/ho-tro#dat-hang',
        permanent: true,
      },
      // ✅ Fix nhóm 5 — blog link chết
      {
        source: '/blog/7-retro-sneakers-tot-nhat-2026',
        destination: '/blog',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*(svg|jpg|jpeg|png|webp|avif|ico|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
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