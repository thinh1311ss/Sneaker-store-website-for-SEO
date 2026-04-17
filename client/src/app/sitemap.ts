import { MetadataRoute } from 'next';
import { getAllProducts, getAllBrands } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // FIX: Dùng domain thật thay vì sneakerstore.vn
  const baseUrl = 'https://www.uitsneakers.io.vn';

  const [products, brands] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
  ]);

  // Trang chính
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collections/all`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/uu-dai`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/nam`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections/nu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/thuong-hieu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ho-tro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // FIX: Trang thương hiệu - dùng /collections/ thay vì /thuong-hieu/
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/collections/${brand.toLowerCase().replace(/ /g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // FIX: Trang sản phẩm - dùng /collections/{brand}/products/{slug}
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/collections/${product.brand.toLowerCase().replace(/ /g, '-')}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...productPages];
}