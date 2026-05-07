import { MetadataRoute } from 'next';
import { getAllProducts, getAllBrands, getAllBlogPosts } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.uitsneakers.io.vn';

  const [products, brands, blogPosts] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getAllBlogPosts(), // ✅ THÊM MỚI: lấy danh sách bài blog
  ]);

  // Trang tĩnh chính
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
    // Trang danh sách thương hiệu — URL thật là /thuong-hieu
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
    // ✅ THÊM MỚI: Các trang hỗ trợ
    {
      url: `${baseUrl}/ho-tro/chinh-sach-doi-tra`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/ho-tro/huong-dan-mua-hang`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Trang thương hiệu - /collections/[brand]
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/collections/${brand.toLowerCase().replace(/ /g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Trang sản phẩm - /collections/[brand]/products/[slug]
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/collections/${product.brand.toLowerCase().replace(/ /g, '-')}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ✅ THÊM MỚI: Trang blog động
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...brandPages, ...productPages, ...blogPages];
}