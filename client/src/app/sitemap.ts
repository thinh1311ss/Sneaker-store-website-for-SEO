import { MetadataRoute } from 'next';
import { getAllProducts, getAllBrands } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sneakerstore.vn';
  const [products, brands] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
  ]);

  // Trang chính
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/uu-dai`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ho-tro`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Trang thương hiệu
  const brandPages = brands.map((brand) => ({
    url: `${baseUrl}/thuong-hieu/${brand.toLowerCase().replace(' ', '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Trang sản phẩm
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...productPages];
}
