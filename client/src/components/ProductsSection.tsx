'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import BrandFilter from '@/components/BrandFilter';
import { Suspense } from 'react';

const HOMEPAGE_PRODUCTS_LIMIT = 12;

interface ProductsSectionProps {
  products: Product[];
  brands: string[];
  totalCount: number;
}

function ProductsSectionInner({ products, brands, totalCount }: ProductsSectionProps) {
  const searchParams = useSearchParams();
  const selectedBrands = searchParams.getAll('brand');

  // Filter chỉ chạy ở client (cần searchParams)
  const filteredProducts =
    selectedBrands.length > 0
      ? products.filter((p) => selectedBrands.includes(p.brand))
      : products;

  return (
    <section id="products" className="py-20" aria-labelledby="all-products-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold mb-4">BỘ SƯU TẬP</span>
          <h2 id="all-products-heading" className="text-3xl md:text-4xl font-bold mb-3">Tất Cả Sản Phẩm</h2>
          <p className="text-gray-700">
            Hiển thị {Math.min(filteredProducts.length, HOMEPAGE_PRODUCTS_LIMIT)} trong {totalCount} sản phẩm sneaker chính hãng
          </p>
        </div>

        <BrandFilter brands={brands} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {filteredProducts.slice(0, HOMEPAGE_PRODUCTS_LIMIT).map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        {totalCount > HOMEPAGE_PRODUCTS_LIMIT && (
          <div className="text-center mt-12">
            <Link
              href="/collections/all"
              aria-label={`Xem tất cả ${totalCount} sản phẩm`}
              className="inline-block px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 hover:scale-105 transition-all"
            >
              Xem tất cả {totalCount} sản phẩm →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProductsSection(props: ProductsSectionProps) {
  return (
    <Suspense fallback={
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto" role="status" aria-label="Đang tải" />
        </div>
      </section>
    }>
      <ProductsSectionInner {...props} />
    </Suspense>
  );
}