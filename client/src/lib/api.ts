import { Product } from './products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Interface cho data từ MongoDB
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
  images?: string[];
}

// Tạo slug từ tên sản phẩm
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

// Chuyển sizes object thành string - hiện tất cả sizes có trong object
function sizesToString(sizes?: MongoProduct['sizes']): string {
  if (!sizes || typeof sizes !== 'object') return '';
  
  // Lấy tất cả sizes từ object, format đẹp
  const sizeOrder = ['US6', 'US6_5', 'US7', 'US7_5', 'US8', 'US8_5', 'US9', 'US9_5', 'US10', 'US10_5'];
  const availableSizes = sizeOrder
    .filter(size => size in sizes) // Chỉ lấy sizes có trong object
    .map(size => size.replace('_', '.').replace('US', 'US '));
  
  return availableSizes.join(', ');
}

// Map từ MongoDB format sang Frontend format
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
  };
}

// Lấy tất cả sản phẩm
export async function getAllProductsFromAPI(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data: MongoProduct[] = await res.json();
    return data.map((item, index) => mapMongoToProduct(item, index));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Lấy sản phẩm theo ID (MongoDB _id)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data: MongoProduct = await res.json();
    return mapMongoToProduct(data, 0);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Lấy sản phẩm theo slug (tìm trong all products)
export async function getProductBySlugFromAPI(slug: string): Promise<Product | null> {
  const products = await getAllProductsFromAPI();
  return products.find((p) => p.slug === slug) ?? null;
}

// Lấy sản phẩm theo brand
export async function getProductsByBrandFromAPI(brand: string): Promise<Product[]> {
  const products = await getAllProductsFromAPI();
  return products.filter(
    (p) => p.brand.toLowerCase().replace(' ', '-') === brand.toLowerCase() ||
           p.brand.toLowerCase() === brand.toLowerCase()
  );
}

// Lấy tất cả brands
export async function getAllBrandsFromAPI(): Promise<string[]> {
  const products = await getAllProductsFromAPI();
  const brands = [...new Set(products.map((p) => p.brand))];
  return brands.sort();
}

// Lấy tất cả slugs (cho generateStaticParams)
export async function getAllSlugsFromAPI(): Promise<string[]> {
  const products = await getAllProductsFromAPI();
  return products.map((p) => p.slug);
}

// Lấy sản phẩm đang sale
export async function getSaleProductsFromAPI(): Promise<Product[]> {
  const products = await getAllProductsFromAPI();
  return products
    .filter((p) => p.discount && p.discount > 0)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0));
}

// Tìm kiếm sản phẩm
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

//BACKWARD COMPATIBLE EXPORTS
// Giữ tên cũ để không phải sửa nhiều file
export const getAllProducts = getAllProductsFromAPI;
export const getProductBySlug = getProductBySlugFromAPI;
export const getProductsByBrand = getProductsByBrandFromAPI;
export const getAllBrands = getAllBrandsFromAPI;
export const getAllSlugs = getAllSlugsFromAPI;
export const getSaleProducts = getSaleProductsFromAPI;
export const searchProducts = searchProductsFromAPI;