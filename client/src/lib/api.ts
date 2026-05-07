const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Interface frontend dùng ──────────────────────────────────────────────────
export interface Product {
  id: number;
  _id?: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  images: string[];
  sizes: string;
  sizesObj?: {
    US6?: number;
    US6_5?: number;
    US7?: number;
    US7_5?: number;
    US8?: number;
    US8_5?: number;
    US9?: number;
    US9_5?: number;
    US10?: number;
    US10_5?: number;
  };
  description: string;
  specs: string;
  careGuide: string;
  storageGuide: string;
  category: string;
  quantity: number;
  gender?: 'Nam' | 'Nữ' | 'Unisex';
}

// ✅ THÊM MỚI: Interface Blog Post
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  author?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
}

// ── Interface MongoDB trả về ─────────────────────────────────────────────────
interface MongoProduct {
  _id: string;
  productName: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  category?: string;
  description?: string;
  specifications?: string;
  careInstructions?: string;
  storageInstructions?: string;
  sizes?: {
    US6?: number;
    US6_5?: number;
    US7?: number;
    US7_5?: number;
    US8?: number;
    US8_5?: number;
    US9?: number;
    US9_5?: number;
    US10?: number;
    US10_5?: number;
  };
  quantity?: number;
  gender?: 'Nam' | 'Nữ' | 'Unisex';
  images?: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function sizesToString(sizes?: MongoProduct['sizes']): string {
  if (!sizes || typeof sizes !== 'object') return '';
  const sizeOrder = ['US6', 'US6_5', 'US7', 'US7_5', 'US8', 'US8_5', 'US9', 'US9_5', 'US10', 'US10_5', 'US11', 'US11_5', 'US12', 'US12_5', 'US13', 'US13_5', 'US14', 'US14_5', 'US15', 'US15_5', 'US16', 'US16_5', 'US17', 'US17_5', 'US18'];
  return sizeOrder
    .filter((s) => s in sizes)
    .map((s) => s.replace('_', '.').replace('US', 'US '))
    .join(', ');
}

function mapMongoToProduct(item: MongoProduct, index: number): Product {
  return {
    id: index + 1,
    _id: item._id,
    name: item.productName,
    slug: createSlug(item.productName),
    brand: item.brand,
    price: item.price,
    originalPrice: item.originalPrice || null,
    discount: item.discountPercent || null,
    image: item.images?.[0] || '/placeholder.jpg',
    images: item.images || [],
    sizes: sizesToString(item.sizes),
    sizesObj: item.sizes,
    description: item.description || '',
    specs: item.specifications || '',
    careGuide: item.careInstructions || '',
    storageGuide: item.storageInstructions || '',
    category: item.category || 'Sneaker',
    quantity: item.quantity || 0,
    gender: item.gender,
  };
}

// ── Format tiền ──────────────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// ── API functions — Product ──────────────────────────────────────────────────
export async function getAllProductsFromAPI(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data: MongoProduct[] = await res.json();
    return data.map((item, index) => mapMongoToProduct(item, index));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data: MongoProduct = await res.json();
    return mapMongoToProduct(data, 0);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProductBySlugFromAPI(slug: string): Promise<Product | null> {
  const products = await getAllProductsFromAPI();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByBrandFromAPI(brand: string): Promise<Product[]> {
  const products = await getAllProductsFromAPI();
  return products.filter(
    (p) =>
      p.brand.toLowerCase().replace(' ', '-') === brand.toLowerCase() ||
      p.brand.toLowerCase() === brand.toLowerCase()
  );
}

export async function getAllBrandsFromAPI(): Promise<string[]> {
  const products = await getAllProductsFromAPI();
  return [...new Set(products.map((p) => p.brand))].sort();
}

export async function getAllSlugsFromAPI(): Promise<string[]> {
  const products = await getAllProductsFromAPI();
  return products.map((p) => p.slug);
}

export async function getSaleProductsFromAPI(): Promise<Product[]> {
  const products = await getAllProductsFromAPI();
  return products
    .filter((p) => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0));
}

// Search vẫn dùng no-store vì kết quả phải real-time
export async function searchProductsFromAPI(query: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/product/search?q=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const products: MongoProduct[] = data.data ?? [];
    return products.map((item, index) => mapMongoToProduct(item, index));
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// ── API functions — Blog ─────────────────────────────────────────────────────
// ✅ THÊM MỚI: Lấy tất cả bài blog (dùng cho sitemap + trang danh sách)
export async function getAllBlogPostsFromAPI(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog`, {
      next: { revalidate: 300 }, // Cache 5 phút
    });
    if (!res.ok) return [];
    const data: BlogPost[] = await res.json();
    // Chỉ lấy bài đã published
    return data.filter((post) => post.published !== false);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// ✅ THÊM MỚI: Lấy 1 bài blog theo slug
export async function getBlogPostBySlugFromAPI(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data: BlogPost = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// ✅ THÊM MỚI: Lấy blog có phân trang
export async function getBlogPostsWithPaginationFromAPI(
  page: number = 1,
  limit: number = 9
): Promise<{ posts: BlogPost[]; total: number; totalPages: number }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/blog?page=${page}&limit=${limit}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
    const data = await res.json();

    // Nếu API trả về object có pagination
    if (data.posts && data.total !== undefined) {
      return {
        posts: data.posts.filter((p: BlogPost) => p.published !== false),
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
      };
    }

    // Nếu API trả về array thẳng → tự phân trang
    const allPosts: BlogPost[] = Array.isArray(data)
      ? data.filter((p: BlogPost) => p.published !== false)
      : [];
    const start = (page - 1) * limit;
    return {
      posts: allPosts.slice(start, start + limit),
      total: allPosts.length,
      totalPages: Math.ceil(allPosts.length / limit),
    };
  } catch (error) {
    console.error('Error fetching blog posts with pagination:', error);
    return { posts: [], total: 0, totalPages: 0 };
  }
}

// ── Backward compatible exports ──────────────────────────────────────────────
export const getAllProducts = getAllProductsFromAPI;
export const getProductBySlug = getProductBySlugFromAPI;
export const getProductsByBrand = getProductsByBrandFromAPI;
export const getAllBrands = getAllBrandsFromAPI;
export const getAllSlugs = getAllSlugsFromAPI;
export const getSaleProducts = getSaleProductsFromAPI;
export const searchProducts = searchProductsFromAPI;

// ✅ THÊM MỚI: Blog exports
export const getAllBlogPosts = getAllBlogPostsFromAPI;
export const getBlogPostBySlug = getBlogPostBySlugFromAPI;
export const getBlogPostsWithPagination = getBlogPostsWithPaginationFromAPI;