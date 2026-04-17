import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/login', '/profile', '/orders'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    // FIX: Domain thật thay vì sneakerstore.vn
    sitemap: 'https://www.uitsneakers.io.vn/sitemap.xml',
  };
}