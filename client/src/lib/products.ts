import productsData from '@/data/products.json';
import brandsData from '@/data/brands.json';

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
}

export function getAllProducts(): Product[] {
  return productsData as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return (productsData as Product[]).find((p) => p.slug === slug);
}

export function getProductsByBrand(brand: string): Product[] {
  return (productsData as Product[]).filter(
    (p) => p.brand.toLowerCase() === brand.toLowerCase()
  );
}

export function getAllBrands(): string[] {
  return brandsData as string[];
}

export function getAllSlugs(): string[] {
  return (productsData as Product[]).map((p) => p.slug);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}
