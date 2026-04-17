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

// ── API functions ────────────────────────────────────────────────────────────
// FIX: Dùng next.revalidate thay vì cache: 'no-store'
// → Cho phép ISR cache HTML trên server, chỉ fetch lại sau 5 phút
// → Giảm TTFB + Speed Index đáng kể

export async function getAllProductsFromAPI(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product`, {
      next: { revalidate: 300 }, // Cache 5 phút
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

// ── Backward compatible exports ──────────────────────────────────────────────
export const getAllProducts = getAllProductsFromAPI;
export const getProductBySlug = getProductBySlugFromAPI;
export const getProductsByBrand = getProductsByBrandFromAPI;
export const getAllBrands = getAllBrandsFromAPI;
export const getAllSlugs = getAllSlugsFromAPI;
export const getSaleProducts = getSaleProductsFromAPI;
export const searchProducts = searchProductsFromAPI;